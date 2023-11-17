import QueueDisplay from './queue.display';
import {ScoreDisplay} from "./score.display";
import {GameDisplay} from "./game.display";

const queue = new QueueDisplay();
const score = new ScoreDisplay();
const game = new GameDisplay();

let ws: WebSocket;

const connect = () => {
  ws = new WebSocket("ws://localhost:8001");

  ws.addEventListener('open', () => {
    ws.send(JSON.stringify({type: 'server'}));
  })

  ws.addEventListener("message", function (event) {
    const payload = JSON.parse(event.data.toString());

    switch (payload.type) {
      case 'game-state':
        game.display(payload);
        break;
      case 'queue-state':
        queue.update(payload);
        break;
      case 'game-score':
        score.updateScore(payload);
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
