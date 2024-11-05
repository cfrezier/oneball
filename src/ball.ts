import {Geometry, Segment, Vector} from "./geometry";
import {Player} from "./player";
import {CONFIG} from "../browser/common/config";


export class Ball {
  color = '#00FFFF';
  key: string;
  position: Vector = [CONFIG.GLOBAL_WIDTH / 2, CONFIG.GLOBAL_HEIGHT / 2]
  lastBouncePlayer?: Player;
  direction: Vector;
  size: number;

  constructor({key, color}: { key: string, color: string }) {
    this.color = color;
    this.key = key;
    this.size = 3;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random();
    this.direction = [speed * Math.cos(angle), speed * Math.sin(angle)];
  }

  trajectory(distance = 1): Segment {
    return [this.position, [this.position[0] + this.direction[0] * distance, this.position[1] + this.direction[1] * distance]];
  }

  bounce(player: Player, intersection: Vector, playerBlock: Segment) {
    this.lastBouncePlayer = player;

    // Determine new velocity
    const previousVelocity = Geometry.vectorNorm(this.direction);
    const coordToUse = intersection[0] === playerBlock[0][0] ? 1 : 0;
    const intersectPercent = (intersection[coordToUse] - playerBlock[0][coordToUse]) / (playerBlock[1][coordToUse] - playerBlock[0][coordToUse]) * 0.9 + 0.05;
    const blockVector = [playerBlock[1][0] - playerBlock[0][0], playerBlock[1][1] - playerBlock[0][1]] as Vector;
    const blockAngle = -1 * ((Math.acos(Geometry.dot([0, 1], blockVector) / (Geometry.vectorNorm([0, 1]) * Geometry.vectorNorm(blockVector))) * (blockVector[0] < 0 ? -1 : 1)) - Math.PI / 2);
    const reboundAngle = Math.PI * (1 - intersectPercent);
    const angle = reboundAngle + blockAngle;
    const newVelocity = previousVelocity * CONFIG.ACCELERATION_FACTOR;
    const dx = Math.cos(angle) * newVelocity;
    const dy = Math.sin(angle) * newVelocity;
    this.direction = Geometry.limitToMax([dx, dy], CONFIG.MAX_SPEED);
    this.move(1);
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

  segmentToCenter(marginWidth = 25 / 2 + 15 / 2) {
    return Ball._segmentToCenter(this.position, marginWidth);
  }

  static _segmentToCenter(position: Vector, marginWidth = 25 / 2 + 15 / 2) {
    const getAwayFromCenterVector = [position[0] - CONFIG.GLOBAL_WIDTH / 2, position[1] - CONFIG.GLOBAL_HEIGHT / 2] as Vector;
    const norm = Geometry.vectorNorm(getAwayFromCenterVector);
    const percentOfNorm = marginWidth / norm;
    const gotAwayFromCenterVectorMargin = getAwayFromCenterVector.map(coord => coord * percentOfNorm) as Vector;

    return [[CONFIG.GLOBAL_WIDTH / 2, CONFIG.GLOBAL_HEIGHT / 2], [position[0] + gotAwayFromCenterVectorMargin[0], position[1] + gotAwayFromCenterVectorMargin[1]]] as Segment;
  }
}