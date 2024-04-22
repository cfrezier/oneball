import QueueDisplay from './queue.display';
import {ScoreDisplay} from "./score.display";
import {GameDisplay} from "./game.display";
import {QrCodeDisplay} from "./qrcode.display";
import {createWs} from '../common/ws';
import {CONFIG} from "../common/config";
import AwardDisplay from "./award.display";

const queue = new QueueDisplay();
const score = new ScoreDisplay();
const game = new GameDisplay();
const qrcode = new QrCodeDisplay();
const award = new AwardDisplay();

let ws: WebSocket;
let lastGameState: any = null;

setInterval(() => {
  award.update(lastGameState);
}, 1000);

const connect = () => {
  ws = createWs();

  ws.addEventListener('open', () => {
    ws.send(JSON.stringify({type: 'server'}));
    qrcode.init();
  })

  ws.addEventListener("message", function (event) {
    const payload = JSON.parse(event.data.toString());

    switch (payload.type) {
      case 'config':
        // @ts-ignore
        Object.keys(payload).forEach(key => CONFIG[key] = payload[key])
        break;
      case 'game-state':
        const game_payload = {
          state: {
            players: [],
            balls: [],
            startDate: undefined,
            width: 0,
            height: 0,
            finished: true
          }, ...payload
        };
        game.display(game_payload);
        break;
      case 'queue-state':
        const queue_payload = {
          state: {
            players: [],
            balls: [],
            startDate: undefined,
            width: 0,
            height: 0,
            finished: true
          }, ...payload
        };
        queue.update(queue_payload);
        break;
      case 'game-score':
        score.updateScore(payload);
        lastGameState = payload;
        break;
      case 'score-state':
        score.updateHighScore(payload);
        break;
    }
  });

  ws.addEventListener('close', (event) => {
    setTimeout(() => connect(), 1000);
  });
}

connect();
