import {Player} from "./player";
import {Queue} from "./queue";
import {Ball} from "./ball";
import {Geometry} from "./geometry";
import {CONFIG} from "../browser/common/config";


export class Game {
  players: Player[] = [];
  startDate?: number;
  queue: Queue;
  balls: Ball[] = [];
  finished = false;
  started: boolean = false;
  ready = false;

  constructor(queue: Queue) {
    this.queue = queue;
  }

  apply(player: Player) {
    if (!this.players.filter(player => player.connected).find(playerInGame => playerInGame.key === player.key)) {
      if (this.players.length < CONFIG.MAX_PLAYERS) {
        this.players.push(player);
        this.players.forEach((player, idx, arr) => player.init(idx, arr));
        player.queued();
        this.createBalls();
      }
      if (this.players.length > (CONFIG.MIN_PLAYERS - 1) && !this.startDate) {
        console.log(`Starting in ${CONFIG.QUEUE_TIME}s`);
        player.queued();
        this.startDate = new Date().getTime() + 1000 * CONFIG.QUEUE_TIME;
        setTimeout(() => this.start(), 1000 * CONFIG.QUEUE_TIME);
        this.queue.initGame();
      }
      this.queue.sendGameToServer();
    }
  }

  start() {
    this.ready = true;
    if (this.players.length >= CONFIG.MIN_PLAYERS) {
      this.started = true;
      this.queue.executeGame();
      this.startDate = new Date().getTime();
      this.queue.sendQueueUpdate();
    } else {
      console.log(`Not enough players... retry in ${CONFIG.RETRY_TIME}s`);
      this.startDate = new Date().getTime() + 1000 * CONFIG.QUEUE_TIME;
      this.queue.sendQueueUpdate();
      setTimeout(() => {
        this.start();
      }, CONFIG.RETRY_TIME * 1000);
    }
  }

  createBalls() {
    this.balls = this.players.map(player => new Ball({key: player.key, color: player.color}));
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
      width: CONFIG.GLOBAL_WIDTH,
      height: CONFIG.GLOBAL_HEIGHT,
      finished: this.finished,
      started: this.started,
      ready: this.ready,
    }
  }

  reward() {
    const elapsed = Math.round(new Date().getTime() - (this.startDate ?? 0)) / 1000;
    console.log('elapsed', elapsed);
    this.players.forEach((player) => player.reward(elapsed));
  }
}