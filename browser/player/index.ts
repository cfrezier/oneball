import {NameComponent} from "./name.component";
import {InputComponent} from "./input.component";
import {v4} from "uuid";
import {QueueComponent} from "./queue.component";
import {createWs} from '../common/ws';

const STORAGE_KEY = 'oneball-key';

const key = localStorage.getItem(STORAGE_KEY) || v4();
localStorage.setItem(STORAGE_KEY, key);

let auth = false;
let ws: WebSocket;
let isInGame = false;
const nameComponent = new NameComponent();
const inputComponent = new InputComponent();
const queueComponent = new QueueComponent();

const propagateAuth = () => {
  const name = nameComponent.value();
  ws.send(JSON.stringify({type: 'joined', key, name}));
  auth = true;
  nameComponent.hide();
  queueComponent.show();
};

const connect = () => {
  ws = createWs();

  nameComponent.init(propagateAuth);
  inputComponent.init(ws, key);
  queueComponent.init(ws, key);

  ws.addEventListener('open', () => {
    console.log("connected.");
  });

  ws.addEventListener('close', (event) => {
    setTimeout(() => connect(), isInGame ? 10 : 1000);
  });

  ws.addEventListener("message", function (event) {
    const payload = JSON.parse(event.data.toString());

    console.log(payload);

    switch (payload.type) {
      case 'queued':
        queueComponent.hide();
        inputComponent.show(payload.color, nameComponent.value());
        isInGame = true;
        break;
      case 'can-queue':
        queueComponent.show();
        inputComponent.hide();
        isInGame = false;
        break;
    }
  });

  if (auth) {
    propagateAuth();
  }
}
connect();