import {NameComponent} from "./name.component";
import {InputComponent} from "./input.component";
import {v4} from "uuid";
import {QueueComponent} from "./queue.component";
import {createWs} from '../common/ws';
import {ScoreComponent} from "./score.component";
import {CONFIG} from "../common/config";
import {WaitComponent} from "./wait.component";
import {IdComponent} from "./id.component";
import {ReloadComponent} from "./reload.component";

const STORAGE_KEY = 'oneball-key';

const key = localStorage.getItem(STORAGE_KEY) || v4();
localStorage.setItem(STORAGE_KEY, key);

let auth = false;
let ws: WebSocket;
let isInGame = false;
const nameComponent = new NameComponent();
const inputComponent = new InputComponent();
const queueComponent = new QueueComponent();
const scoreComponent = new ScoreComponent();
const waitComponent = new WaitComponent();
const idComponent = new IdComponent();

const reloadComponent = new ReloadComponent();
let autoReconnect = true;

const propagateAuth = () => {
  const name = nameComponent.value();
  ws.send(JSON.stringify({type: 'joined', key, name}));
  auth = true;
  nameComponent.hide();
  scoreComponent.hide();
  queueComponent.show();
  waitComponent.hide();
  idComponent.init();
  reloadComponent.init();
};

const connect = () => {
  ws = createWs();

  nameComponent.init(propagateAuth, () => refreshTimeout());
  inputComponent.init(ws, key, () => refreshTimeout());
  queueComponent.init(ws, key);
  scoreComponent.init();
  waitComponent.init();
  idComponent.init();

  ws.addEventListener('open', () => {
    console.log("connected.");
    waitComponent.hide();
  });

  ws.addEventListener('error', (ev) => {
    console.log("WS error:", ev);
  });

  ws.addEventListener('close', (event) => {
    if (autoReconnect) {
      setTimeout(() => connect(), CONFIG['AUTO_RECONNECT_DELAY']);
    }
  });

  ws.addEventListener("message", function (event) {
    const payload = JSON.parse(event.data.toString());

    switch (payload.type) {
      case 'queued':
        queueComponent.hide();
        inputComponent.show(payload.color, nameComponent.value());
        waitComponent.show();
        isInGame = true;
        refreshTimeout();
        break;
      case 'can-queue':
        queueComponent.show();
        inputComponent.hide();
        waitComponent.hide();
        isInGame = false;
        refreshTimeout();
        break;
      case 'wait-over':
        waitComponent.hide();
        refreshTimeout();
        break;
      case 'score':
        scoreComponent.display(payload.score);
        waitComponent.hide();
        refreshTimeout();
        break;
    }
  });

  if (auth) {
    propagateAuth();
  }
}

let timeout: any;
const refreshTimeout = () => {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    autoReconnect = false;
    ws.close();
    console.log(`disconnect after ${CONFIG['ACTIVITY_TIMEOUT']}ms inactivity`);
    nameComponent.hide();
    inputComponent.hide();
    scoreComponent.hide();
    queueComponent.hide();
    waitComponent.hide();
    reloadComponent.show();
  }, CONFIG['ACTIVITY_TIMEOUT']);
}

fetch('/config.json').then(config => {
  config.json().then(json => {
    // @ts-ignore
    Object.keys(json).forEach(key => CONFIG[key] = json[key])
    console.log(JSON.stringify(CONFIG), 4);

    connect();

    refreshTimeout();
  })
})

