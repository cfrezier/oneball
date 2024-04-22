import {WebSocket} from 'ws';
import {DataMsg} from "./data.message";
import {Queue} from "./queue";
import {CONFIG} from "../browser/common/config";

const wss = () => {
  const wss = new WebSocket.Server({port: CONFIG.WSS_PORT});
  const queue = new Queue(CONFIG.PATH as string, CONFIG.BOTS);

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

  console.log(`WSS server listening on port http://0.0.0.0:${CONFIG.WSS_PORT}`);

  return wss;
}


export {wss};
