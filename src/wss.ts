import {WebSocket} from 'ws';
import {Player} from "./player";
import {Game} from "./game";
import {DataMsg} from "./data.message";
import {Queue} from "./queue";
import {Simulate} from "./simulate";

const PORT = 8001;
const wss = new WebSocket.Server({host: "0.0.0.0", port: PORT});
const queue = new Queue(process.argv[2] ?? '/tmp/oneball-save.json');
Simulate.init(queue);

wss.on('connection', (ws) => {
  console.log('New client');
  ws.on('message', (data) => {
    // console.log('WSS received: %s', data);
    const payload = JSON.parse(data.toString()) as DataMsg;

    queue.processMsg(payload, ws);
  });
  ws.on('close', () => {
    queue.disconnect(ws);
  })
});

console.log(`WSS server listening on port http://0.0.0.0:${PORT}`);

export {wss};
