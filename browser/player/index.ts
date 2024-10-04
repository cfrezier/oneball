import {NameComponent} from "./name.component";
import {InputComponent} from "./input.component";
import {v4} from "uuid";
import {QueueComponent} from "./queue.component";
import {createWs} from '../common/ws';
import {ScoreComponent} from "./score.component";
import {CONFIG} from "../common/config";
import {WaitComponent} from "./wait.component";

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

const propagateAuth = () => {
  const name = nameComponent.value();
  ws.send(JSON.stringify({type: 'joined', key, name}));
  auth = true;
  nameComponent.hide();
  scoreComponent.hide();
  queueComponent.show();
  waitComponent.hide();
};

fetch('/config.json').then(config => {
  config.json().then(json => {
    // @ts-ignore
    Object.keys(json).forEach(key => CONFIG[key] = json[key])
    console.log(JSON.stringify(CONFIG), 4);

    const connect = () => {
      ws = createWs();

      nameComponent.init(propagateAuth);
      inputComponent.init(ws, key);
      queueComponent.init(ws, key);
      scoreComponent.init();
      waitComponent.init();

      ws.addEventListener('open', () => {
        console.log("connected.");
        waitComponent.hide();
      });

      ws.addEventListener('error', (ev) => {
        console.log("WS error:", ev);
      });

      ws.addEventListener('close', (event) => {
        setTimeout(() => connect(), isInGame ? 10 : 1000);
      });

      ws.addEventListener("message", function (event) {
        const payload = JSON.parse(event.data.toString());

        switch (payload.type) {
          case 'queued':
            queueComponent.hide();
            inputComponent.show(payload.color, nameComponent.value());
            waitComponent.show();
            isInGame = true;
            break;
          case 'can-queue':
            queueComponent.show();
            inputComponent.hide();
            waitComponent.hide();
            isInGame = false;
            break;
          case 'wait-over':
            waitComponent.hide();
            break;
          case 'score':
            scoreComponent.display(payload.score);
            waitComponent.hide();
            break;
        }
      });

      if (auth) {
        propagateAuth();
      }
    }
    connect();
  })
})