import {NameComponent} from "./name.component";
import {InputComponent} from "./input.component";
import {v4} from "uuid";
import {QueueComponent} from "./queue.component";

const STORAGE_KEY = 'oneball-key';

const key = localStorage.getItem(STORAGE_KEY) || v4();
localStorage.setItem(STORAGE_KEY, key);

let auth = false;
let ws: WebSocket;
const nameComponent = new NameComponent();
const inputComponent = new InputComponent();
const queueComponent = new QueueComponent();

const propagateAuth = () => {
  const name = nameComponent.value();
  ws.send(JSON.stringify({type: 'joined', key, name}));
  auth = true;
  nameComponent.hide();
  inputComponent.show();
  queueComponent.show();
};

const connect = () => {
  ws = new WebSocket(window.location.toString().replace("http://", "ws://").replace("8002", "8001"));

  nameComponent.init(propagateAuth);
  inputComponent.init(ws, key);
  queueComponent.init(ws, key);

  ws.addEventListener('open', () => {
    console.log("connected.");
  });

  ws.addEventListener('close', (event) => {
    setTimeout(() => connect(), 1000);
  });

  if (auth) {
    propagateAuth();
  }
}
connect();