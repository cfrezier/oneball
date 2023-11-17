import {WebSocket} from "ws";
import {v4 as uuid} from 'uuid';
import {colors} from "./colors";
import {Geometry, Segment, Vector} from "./geometry";
import {Ball} from "./ball";

const START_BLOCK_SIZE_PERCENT = 0.1;
const MIN_BLOCK_SIZE_PERCENT = 0.02;
const MAX_BLOCK_SIZE_PERCENT = 0.3;

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

  startAngle?: number;
  endAngle?: number;
  defenseLine: Segment = [[0, 0], [1, 1]];

  input = 0;
  sizePercent: number = START_BLOCK_SIZE_PERCENT;

  points = 0;
  totalPoints = 0;

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
    this.defenseLine = [
      [(0.5 + Math.cos(this.startAngle) / 2) * Geometry.GLOBAL_WIDTH,
        (0.5 + Math.sin(this.startAngle) / 2) * Geometry.GLOBAL_HEIGHT],
      [(0.5 + Math.cos(this.endAngle) / 2) * Geometry.GLOBAL_WIDTH,
        (0.5 + Math.sin(this.endAngle) / 2) * Geometry.GLOBAL_HEIGHT]
    ]
    this.input = 0.5;
  }

  block(): Segment {
    const startPercent = this.input - this.sizePercent;
    const endPercent = this.input + this.sizePercent;
    const first = [(this.defenseLine[0][0] * (1 - startPercent) + this.defenseLine[1][0] * (startPercent)), (this.defenseLine[0][1] * (1 - startPercent) + this.defenseLine[1][1] * (startPercent))] as Vector;
    const second = [(this.defenseLine[0][0] * (1 - endPercent) + this.defenseLine[1][0] * (endPercent)), (this.defenseLine[0][1] * (1 - endPercent) + this.defenseLine[1][1] * (endPercent))] as Vector;
    return [first, second];
  }

  distance(p1: Vector, p2: Vector) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))
  }

  lost(ball: Ball) {
    this.points -= ball.key === this.key ? 5 : 1;
    this.sizePercent = Math.max(MIN_BLOCK_SIZE_PERCENT, this.sizePercent * (ball.key === this.key ? DECREASE_BALL_FACTOR_SELF : DECREASE_BALL_FACTOR_OTHER));
  }

  gain(ball: Ball) {
    console.log(`player ${this.name} gains ${ball.key === this.key ? 5 : 1}`);
    this.points += ball.key === this.key ? 5 : 1;
    this.sizePercent = Math.min(MAX_BLOCK_SIZE_PERCENT, this.sizePercent * (ball.key === this.key ? INCREASE_BALL_FACTOR_SELF : INCREASE_BALL_FACTOR_OTHER));
  }

  disconnect() {
    this.connected = false;
    this.ws = undefined;
  }

  move(input: number) {
    this.input = input;
  }

  state() {
    return {
      color: this.color,
      name: this.name,
      defenseLine: this.defenseLine,
      points: this.points,
      total: this.totalPoints + this.points,
      block: this.block()
    };
  }

  reward() {
    this.totalPoints += this.points;
    this.points = 0;
  }
}