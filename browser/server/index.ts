import QueueDisplay from './queue.display';
import {ScoreDisplay} from "./score.display";
import {GameDisplay} from "./game.display";

const queue = new QueueDisplay();
const score = new ScoreDisplay();
const game = new GameDisplay();

const ws = new WebSocket("ws://localhost:8001");
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
      score.updateScore(payload);
      break;
    case 'score-state':
      score.updateHighScore(payload);
  }
});