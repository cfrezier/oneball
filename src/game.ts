import {Player} from "./player";
import {Queue} from "./queue";
import {Ball} from "./ball";
import {Geometry} from "./geometry";

const MAX_PLAYERS = 8;
const QUEUE_TIME = 3;
const RETRY_TIME = 10;

export class Game {
  players: Player[] = [];
  startDate?: number;
  queue: Queue;
  balls: Ball[] = [];
  finished = false;
  started: boolean = false;
  ready = false;
  startTime?: Date;

  constructor(queue: Queue) {
    this.queue = queue;
  }

  apply(player: Player) {
    if (!this.players.filter(player => player.connected).find(playerInGame => playerInGame.key === player.key)) {
      if (this.players.length < MAX_PLAYERS) {
        this.players.push(player);
        this.players.forEach((player, idx, arr) => player.init(idx, arr));
        player.queued();
      }
      if (this.players.length > 2 && !this.startDate) {
        console.log(`Starting in ${QUEUE_TIME}s`);
        this.startDate = new Date().getTime() + 1000 * QUEUE_TIME;
        setTimeout(() => this.start(), 1000 * QUEUE_TIME);
        this.queue.initGame();
        this.queue.sendGameToServer();
      }
    }
  }

  start() {
    this.ready = true;
    if (this.players.length > 1) {
      this.started = true;
      this.queue.executeGame();
      this.startTime = new Date();
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
    console.log("Game initialized");
  }

  execute() {
    const ballsRemoval: string[] = [];
    this.balls.forEach(ball => {
      let intersect = false;
      const trajectory = ball.trajectory();

      // Verify if ball crossing player defense line
      this.players.forEach(player => {
        const intersection = Geometry.getIntersection(player.defenseLine, trajectory);
        if (intersection) {
          intersect = true;
          const playerBlock = player.block();
          const rebound = Geometry.getIntersection(playerBlock, trajectory);
          if (rebound) {
            // Rebound from the defense block
            ball.bounce(player, rebound, playerBlock);
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
        if (ball.checkOutsideBounds()) {
          // Ball is going outside can happens at corners blocked by mutltiple players, then don't apply penalty
          ballsRemoval.push(ball.key);
          ball.lastBouncePlayer?.gain(ball);
        }
      }
    });

    // Remove balls that have scored
    this.balls = this.balls.filter(ball => !ballsRemoval.includes(ball.key));

    // set finished when ended
    this.finished = this.balls.length === 0;

    if (this.finished) {
      this.players.forEach(player => player.canQueue());
    }
  }

  state() {
    return {
      players: this.players.map(player => player.state()).sort((p1, p2) => p1.points - p2.points),
      balls: this.balls.map(ball => ball.state()),
      startDate: this.startDate,
      width: Geometry.GLOBAL_WIDTH,
      height: Geometry.GLOBAL_HEIGHT,
      finished: this.finished,
      started: this.started,
      ready: this.ready,
    }
  }

  reward() {
    const elapsed = Math.round(new Date().getTime() - (this.startTime?.getTime() ?? 0)) / 1000;
    this.players.forEach((player) => player.reward(elapsed));
  }
}