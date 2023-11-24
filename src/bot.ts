import {Queue} from "./queue";
import {Player} from "./player";
import {Game} from "./game";
import {Geometry, Vector} from "./geometry";

let id = 1;
const MAX_MOVE_CHANGE = 0.05;

export class Bot {
  id = id++;
  key = `key-bot-${this.id}`;
  name = `Bot ${this.id}`;
  player?: Player;
  previousInput = 0.5;

  constructor(queue: Queue) {
    setTimeout(() => {
      queue.processMsg({type: 'joined', name: this.name, key: this.key}, undefined);
    }, 100);
    setTimeout(() => {
      this.queue(queue);
    }, 1000);
  }

  link(player: Player) {
    this.player = player;
  }

  queue(queue: Queue) {
    queue.processMsg({type: 'queue', key: this.key}, undefined);
  }

  newInput(game: Game, queue: Queue) {
    const line = this.player!.defenseLine;
    const ballsSortedByDistance = game.balls.map(ball => {
      const ap = [ball.position[0] - line[0][0], ball.position[1] - line[0][1]] as Vector;
      const ab = [line[1][0] - line[0][0], line[0][0] - line[0][1]] as Vector;
      let t = Geometry.dot(ap, ab) / Math.pow(Geometry.vectorNorm(ab), 2);
      t = Math.min(Math.max(0, t), 1);
      const projected = [line[0][0] + t * ab[0], line[0][1] + t * ab[1]] as Vector;
      const pprojected = [projected[0] - ball.position[0], projected[1] - ball.position[1]] as Vector;
      return {ball, distance: Geometry.vectorNorm(pprojected), input: (this.player!.reverseInput ? 1 - t : t)};
    });
    ballsSortedByDistance.sort((a, b) => a.distance - b.distance);

    const chasingBall = ballsSortedByDistance[0];
    queue.processMsg({type: 'input', key: this.key, input: `${chasingBall.input}`}, undefined);

  }
}