import {Geometry, Segment, Vector} from "./geometry";
import {Player} from "./player";

const ACCELERATION_FACTOR = 1.5;

export class Ball {
  color = '#00FFFF';
  key: string;
  position: Vector = [Geometry.GLOBAL_WIDTH / 2, Geometry.GLOBAL_HEIGHT / 2]
  lastBouncePlayer?: Player;
  direction: Vector;
  size: number;
  justBounced = false;

  constructor({key, color}: { key: string, color: string }) {
    this.color = color;
    this.key = key;
    this.size = 5;
    this.direction = [this.randomVelocity(), this.randomVelocity()];
  }

  randomVelocity() {
    return (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2);
  }

  trajectory(): Segment {
    return [this.position, [this.position[0] + this.direction[0], this.position[1] + this.direction[1]]];
  }

  bounce(player: Player, intersection: Vector, playerBlock: Segment) {
    this.lastBouncePlayer = player;
    this.position = intersection;

    // Determine new velocity
    const previousVelocity = Geometry.vectorNorm(this.direction);
    const intersectPercent = (intersection[0] - playerBlock[0][0]) / (playerBlock[1][0] - playerBlock[0][0]);
    console.log('intersectPercent', intersectPercent);
    const intersectDegree = intersectPercent - 0.5;
    console.log('intersectDegree', intersectDegree);
    const blockVector = [playerBlock[1][0] - playerBlock[0][0], playerBlock[1][1] - playerBlock[0][1]] as Vector;
    const blockAngle = Math.acos(Geometry.dot([0, 1], blockVector) / (Geometry.vectorNorm([0, 1]) * Geometry.vectorNorm(blockVector))) * (blockVector[0] < 0 ? 1 : -1);
    console.log(`blockAngle for player ${player.name}`, blockAngle * 180 / Math.PI);
    const reboundAngle = intersectPercent * Math.PI;
    console.log('reboundAngle', reboundAngle * 180 / Math.PI);
    const angle = reboundAngle + blockAngle;
    console.log('angle', angle * 180 / Math.PI);
    const newVelocity = previousVelocity * Math.abs(1 - intersectDegree) * ACCELERATION_FACTOR;
    const dx = Math.cos(angle + Math.PI / 2) * newVelocity;
    const dy = Math.sin(angle + Math.PI / 2) * newVelocity;
    console.log('dx,dy', dx, dy)
    this.direction = Geometry.limitToMax([dx, dy], 50);
    console.log('***********');

    this.justBounced = true;
  }

  move() {
    this.position[0] += this.direction[0];
    this.position[1] += this.direction[1];
    this.justBounced = false;
  }

  state() {
    return {
      position: this.position,
      color: this.color,
      size: this.size
    };
  }
}