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
        this.checkForStartedBelow1Min();
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

  start(retry = 0) {
    this.clearCheckTimer();
    this.ready = true;
    if (this.players.length >= CONFIG.MIN_PLAYERS) {
      this.started = true;
      this.queue.doneWaiting();
      this.queue.executeGame();
      this.startDate = new Date().getTime();
      this.queue.sendQueueUpdate();
    } else {
      console.log(`Not enough players... retry in ${CONFIG.RETRY_TIME}s`);
      this.startDate = new Date().getTime() + 1000 * CONFIG.QUEUE_TIME;
      this.queue.sendQueueUpdate();
      if (retry > 3) {
        console.log(`Clearing queue.`);
        this.queue.clear();
      } else {
        setTimeout(() => {
          console.log(`Retrying...`);
          this.start(retry + 1);
        }, CONFIG.RETRY_TIME * 1000);
      }
    }
  }

  createBalls() {
    this.balls = this.players.map(player => new Ball({key: player.key, color: player.color}));
  }

  execute(changeScoreListener: () => void) {
    const ballsRemoval: string[] = [];

    // rayon du cercle inscrit dans un triangle equilateral
    const checkLength = Geometry.segmentNorm(this.players[0].defenseLine) / (2 * Math.tan(Math.PI / this.players.length) - 5);

    this.balls.forEach(ball => {
      let intersect = false;
      const segmentCenterToBall = ball.segmentToCenter();

      if (Geometry.segmentNorm(segmentCenterToBall) > checkLength) {
        // Verify if ball crossing player defense line
        this.players.forEach(player => {
          const intersection = Geometry.getIntersection(player.defenseLine, segmentCenterToBall);
          if (intersection) {
            intersect = true;
            const playerBlock = player.block();
            const rebound = Geometry.getIntersection(playerBlock, segmentCenterToBall);
            if (rebound) {
              // Rebound from the defense block
              ball.bounce(player, rebound, playerBlock);
            } else {
              // Goal
              ballsRemoval.push(ball.key);
              player.lost(ball);
              ball.lastBouncePlayer?.gain(ball);
              changeScoreListener();
            }
          }
        });
        if (!intersect) {
          // Then simply move ball
          ball.move();
        }
      } else {
        ball.move();
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

  checkTimer?: any;

  private checkForStartedBelow1Min() {
    this.clearCheckTimer();
    console.log('...setting check timer');
    this.checkTimer = setTimeout(() => {
      this.queue.clear();
    }, 60000);
  }

  clearCheckTimer() {
    if (this.checkTimer) {
      clearTimeout(this.checkTimer);
      console.log('...clearing check timer');
    }
  }
}