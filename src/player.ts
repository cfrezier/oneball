import {WebSocket} from "ws";
import {v4 as uuid} from 'uuid';
import {colors} from "./colors";
import {Segment} from "./geometry";
import {Ball} from "./ball";

const SQUARE_SIDE_SIZE = 50;

const START_BLOCK_SIZE = 40;
const MIN_BLOCK_SIZE = 25;
const MAX_BLOCK_SIZE = 70;

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
  defenseLineLength: number = 10;

  input = 0;
  size: number = START_BLOCK_SIZE;

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
      [(0.5 + Math.cos(this.startAngle) / 2) * SQUARE_SIDE_SIZE,
        (0.5 + Math.sin(this.startAngle) / 2) * SQUARE_SIDE_SIZE],
      [(0.5 + Math.cos(this.endAngle) / 2) * SQUARE_SIDE_SIZE,
        (0.5 + Math.sin(this.endAngle) / 2) * SQUARE_SIDE_SIZE]
    ]
    this.defenseLineLength = Math.sqrt(Math.pow(this.defenseLine[1][0] - this.defenseLine[0][0], 2) + Math.pow(this.defenseLine[1][1] - this.defenseLine[0][1], 2));
    this.input = 0;
  }

  block(): Segment {
    const distanceStartPercent = this.defenseLineLength * this.input - 0.5 * this.size / this.defenseLineLength;
    const distanceEndPercent = this.defenseLineLength * this.input + 0.5 * this.size / this.defenseLineLength;
    return [[(this.defenseLine[0][0] - this.defenseLine[1][0]) * distanceStartPercent, ((this.defenseLine[0][1] - this.defenseLine[1][1]) * distanceStartPercent)],
      [(this.defenseLine[0][0] - this.defenseLine[1][0]) * distanceEndPercent, ((this.defenseLine[0][1] - this.defenseLine[1][1]) * distanceEndPercent)]];
  }

  lost(ball: Ball) {
    this.points -= ball.key === this.key ? 5 : 1;
    this.size = Math.max(MIN_BLOCK_SIZE, this.size * (ball.key === this.key ? DECREASE_BALL_FACTOR_SELF : DECREASE_BALL_FACTOR_OTHER));
  }

  gain(ball: Ball) {
    this.points += ball.key === this.key ? 5 : 1;
    this.size = Math.min(MAX_BLOCK_SIZE, this.size * (ball.key === this.key ? INCREASE_BALL_FACTOR_SELF : INCREASE_BALL_FACTOR_OTHER));
  }

  disconnect() {
    this.connected = false;
    this.ws = undefined;
  }

  state() {
    return {
      color: this.color,
      name: this.name,
      defenseLine: this.defenseLine,
      size: this.size,
      points: this.points,
      total: this.totalPoints,
      block: this.block()
    };
  }

  reward() {
    this.totalPoints += this.points;
    this.points = 0;
  }
}