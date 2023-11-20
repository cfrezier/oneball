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
    const intersectPercent = (intersection[0] - playerBlock[0][0]) / (playerBlock[1][0] - playerBlock[0][0]) * 0.9 + 0.05;
    //console.log('intersectPercent', intersectPercent);
    const blockVector = [playerBlock[1][0] - playerBlock[0][0], playerBlock[1][1] - playerBlock[0][1]] as Vector;
    const blockAngle = -1 * ((Math.acos(Geometry.dot([0, 1], blockVector) / (Geometry.vectorNorm([0, 1]) * Geometry.vectorNorm(blockVector))) * (blockVector[0] < 0 ? -1 : 1)) - Math.PI / 2);
    //console.log(`blockAngle for player ${player.name}`, blockAngle * 180 / Math.PI);
    const reboundAngle = Math.PI * (1 - intersectPercent);
    //console.log('reboundAngle', reboundAngle * 180 / Math.PI);
    const angle = reboundAngle + blockAngle;
    //console.log('angle', angle * 180 / Math.PI);
    const newVelocity = previousVelocity * Math.abs(1.5 - intersectPercent) * ACCELERATION_FACTOR;
    const dx = Math.cos(angle) * newVelocity;
    const dy = Math.sin(angle) * newVelocity;
    //console.log('dx,dy', dx, dy)
    this.direction = Geometry.limitToMax([dx, dy], 50);
    //console.log('***********');

    this.move(0.001);
  }

  move(percent = 1) {
    this.position[0] += this.direction[0] * percent;
    this.position[1] += this.direction[1] * percent;
  }

  state() {
    return {
      position: this.position,
      color: this.color,
      size: this.size
    };
  }

  checkOutsideBounds() {
    return this.position[0] < 0 || this.position[1] < 0 || this.position[0] > Geometry.GLOBAL_WIDTH || this.position[1] > Geometry.GLOBAL_HEIGHT;
  }
}