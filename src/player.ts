import {WebSocket} from "ws";
import {v4 as uuid} from 'uuid';
import {colors} from "./colors";
import {Segment, Vector} from "./geometry";
import {Ball} from "./ball";
import {CONFIG} from "../browser/common/config";

const START_BLOCK_SIZE_PERCENT = 0.15;
const MIN_BLOCK_SIZE_PERCENT = 0.02;
const MAX_BLOCK_SIZE_PERCENT = 0.4;

/* To debug bounces etc */
/*
const START_BLOCK_SIZE_PERCENT = 0.9;
const MIN_BLOCK_SIZE_PERCENT = 0.8;
const MAX_BLOCK_SIZE_PERCENT = 1;
*/

const DECREASE_BALL_FACTOR_OTHER = 0.8;
const DECREASE_BALL_FACTOR_SELF = 0.5;

const INCREASE_BALL_FACTOR_OTHER = 1.2;
const INCREASE_BALL_FACTOR_SELF = 1.5;

export class Player {
  connected = true;
  color: string = '#000000';
  name = 'Player';
  key: string;
  ws?: WebSocket;
  time: number = 0;

  startAngle?: number;
  endAngle?: number;
  defenseLine: Segment = [[0, 0], [1, 1]];

  input = 0;
  sizePercent: number = START_BLOCK_SIZE_PERCENT;

  points = 0;
  totalPoints = 0;
  reverseInput: boolean = false;
  ratio: number = 0;
  playerWidthPercent: number = 0.03;

  constructor(name: string, key?: string) {
    this.name = name;
    this.key = key ?? uuid();
  }

  connect(ws?: WebSocket) {
    this.connected = true;
    this.ws = ws;
  }

  init(idx: number, arr: Player[]) {
    this.points = 0;
    this.color = colors[idx];
    this.startAngle = 2 * Math.PI * idx / arr.length;
    this.endAngle = 2 * Math.PI * (idx + 1) / arr.length;
    this.sizePercent = START_BLOCK_SIZE_PERCENT;
    this.defenseLine = [
      [(0.5 + Math.cos(this.startAngle) / 2) * CONFIG.GLOBAL_WIDTH,
        (0.5 + Math.sin(this.startAngle) / 2) * CONFIG.GLOBAL_HEIGHT],
      [(0.5 + Math.cos(this.endAngle) / 2) * CONFIG.GLOBAL_WIDTH,
        (0.5 + Math.sin(this.endAngle) / 2) * CONFIG.GLOBAL_HEIGHT]
    ]
    this.playerWidthPercent = 25 / Math.sqrt(Math.pow(this.defenseLine[0][0] - this.defenseLine[1][0], 2) + Math.pow(this.defenseLine[0][1] - this.defenseLine[1][1], 2));
    this.input = 0.5;
    this.reverseInput = this.defenseLine[0][0] > this.defenseLine[1][0];
    this.updateRatio();
  }

  block(): Segment {
    const startPercent = this.input - this.sizePercent;
    const endPercent = this.input + this.sizePercent;
    const first = [(this.defenseLine[0][0] * (1 - startPercent) + this.defenseLine[1][0] * (startPercent)), (this.defenseLine[0][1] * (1 - startPercent) + this.defenseLine[1][1] * (startPercent))] as Vector;
    const second = [(this.defenseLine[0][0] * (1 - endPercent) + this.defenseLine[1][0] * (endPercent)), (this.defenseLine[0][1] * (1 - endPercent) + this.defenseLine[1][1] * (endPercent))] as Vector;
    return [first, second];
  }

  displayBlock(): Segment {
    const startPercent = this.input - this.sizePercent + this.playerWidthPercent;
    const endPercent = this.input + this.sizePercent - this.playerWidthPercent;
    const first = [(this.defenseLine[0][0] * (1 - startPercent) + this.defenseLine[1][0] * (startPercent)), (this.defenseLine[0][1] * (1 - startPercent) + this.defenseLine[1][1] * (startPercent))] as Vector;
    const second = [(this.defenseLine[0][0] * (1 - endPercent) + this.defenseLine[1][0] * (endPercent)), (this.defenseLine[0][1] * (1 - endPercent) + this.defenseLine[1][1] * (endPercent))] as Vector;
    return [first, second];
  }

  lost(ball: Ball) {
    console.log(`player ${this.name} lost ${ball.key === this.key ? 5 : 1}`);
    this.points -= ball.key === this.key ? 5 : 1;
    this.sizePercent = Math.max(MIN_BLOCK_SIZE_PERCENT, this.sizePercent * (ball.key === this.key ? DECREASE_BALL_FACTOR_SELF : DECREASE_BALL_FACTOR_OTHER));
    this.updateRatio();
  }

  gain(ball: Ball) {
    console.log(`player ${this.name} gains ${ball.key === this.key ? 5 : 1}`);
    this.points += ball.key === this.key ? 5 : 1;
    this.sizePercent = Math.min(MAX_BLOCK_SIZE_PERCENT, this.sizePercent * (ball.key === this.key ? INCREASE_BALL_FACTOR_SELF : INCREASE_BALL_FACTOR_OTHER));
    this.updateRatio();
  }

  disconnect() {
    this.connected = false;
    this.ws = undefined;
  }

  move(payload: { type: "input"; input: string; key: string }) {
    this.input = this.reverseInput ? 1 - parseFloat(payload.input + '') : parseFloat(payload.input + '');
  }

  state() {
    // console.log(this.block(), this.displayBlock());
    return {
      color: this.color,
      name: this.name,
      defenseLine: this.defenseLine,
      points: this.points,
      total: this.totalPoints + this.points,
      block: this.block(),
      displayBlock: this.displayBlock(),
      key: this.key
    };
  }

  reward(time: number) {
    this.totalPoints += this.points;
    this.time += time;
    this.updateRatio();
    this.points = 0;
    this.ws?.send(JSON.stringify({type: 'score', score: this.totalPoints}));
  }

  queued() {
    this.ws?.send(JSON.stringify({type: 'queued', color: this.color}));
  }

  stopWait() {
    this.ws?.send(JSON.stringify({type: 'wait-over', color: this.color}));
  }

  canQueue() {
    this.ws?.send(JSON.stringify({type: 'can-queue'}));
  }

  static from(playerObj: Player) {
    const player = new Player(playerObj.name, playerObj.key);
    player.totalPoints = playerObj.totalPoints;
    player.time = playerObj.time;
    player.connected = false;
    return player;
  }

  serializable() {
    return {
      totalPoints: this.totalPoints,
      time: this.time,
      name: this.name,
      key: this.key,
    };
  }

  public updateRatio() {
    this.ratio = (this.totalPoints + this.points) / (this.time + 1000);
  }
}