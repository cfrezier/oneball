import {Geometry, Segment, Vector} from "./geometry";
import {Player} from "./player";

export class Ball {
  color = '#00FFFF';
  key: string;
  x: number;
  y: number;
  lastBouncePlayer?: Player;
  direction: Vector;
  size: number;

  constructor({key, color}: { key:string, color: string}) {
    this.color = color;
    this.key = key;
    this.x = Geometry.GLOBAL_WIDTH / 2;
    this.y = Geometry.GLOBAL_HEIGHT / 2;
    this.size = 5;
    this.direction = [Math.random() + 0.5, Math.random() + 0.5];
  }

  trajectory(): Segment {
    return [[this.x, this.y], [this.x + this.direction[0], this.y + this.direction[1]]];
  }

  bounce(player: Player) {
    this.lastBouncePlayer = player;
    this.direction = Geometry.reflect(this.direction, player.defenseLine);
  }

  move() {
    this.x += this.direction[0];
    this.y += this.direction[1];
  }

  state() {
    return {
      position: [this.x, this.y],
      color: this.color,
      size: this.size
    };
  }
}