import {Player} from "./player";
import {Queue} from "./queue";
import {Ball} from "./ball";
import {Geometry} from "./geometry";

const MAX_PLAYERS = 8;
const QUEUE_TIME = 30;
const RETRY_TIME = 10;

export class Game {
  players: Player[] = [];
  startDate?: number;
  queue: Queue;
  balls: Ball[] = [];
  finished = false;

  constructor(queue: Queue) {
    this.queue = queue;
  }

  apply(player: Player) {
    if (!this.players.find(playerInGame => playerInGame.key === player.key)) {
      if (this.players.length < MAX_PLAYERS) {
        this.players.push(player);
      }
      if (this.players.length > 1 && !this.startDate) {
        console.log(`Starting in ${QUEUE_TIME}s`);
        this.startDate = new Date().getTime() + 1000 * QUEUE_TIME;
        setTimeout(() => this.start(), 1000 * QUEUE_TIME);
      }
    }
  }

  start() {
    if (this.players.length > 1) {
      this.queue.launchGame();
    } else {
      console.log(`Not enough players... retry in ${RETRY_TIME}s`);
      this.startDate = new Date().getTime() + 1000 * QUEUE_TIME;
      setTimeout(() => {
        this.start();
      }, RETRY_TIME * 1000);
    }
  }

  init() {
    this.balls = this.players.map(player => new Ball({key: player.key, color: player.color}));
    this.players.forEach((player, idx, arr) => player.init(idx, arr));
  }

  execute() {
    const ballsRemoval: string[] = [];
    this.balls.forEach(ball => {
      let intersect = false;
      const trajectory = ball.trajectory();

      // Verify if ball crossing player defense line
      this.players.forEach(player => {
        const intersects = Geometry.segmentsIntersects(player.defenseLine, trajectory);
        if (intersects) {
          intersect = true;
          const rebound = Geometry.segmentsIntersects(player.block(), trajectory);
          if (rebound) {
            // Rebound from the defenser block
            ball.bounce(player);
          } else {
            // Goal
            ballsRemoval.push(ball.key);
            player.lost(ball);
            ball.lastBouncePlayer?.gain(ball);
          }
        }
      });

      if (!intersect) {
        // Then simply move ball
        ball.move();
      }
    });

    // Remove balls that have scored
    this.balls = this.balls.filter(ball => !ballsRemoval.includes(ball.key));

    // set finished when ended
    this.finished = this.balls.length === 0;
  }

  state() {
    return {
      players: this.players.map(player => player.state()),
      balls: this.balls.map(ball => ball.state()),
      startDate: this.startDate
    }
  }
}