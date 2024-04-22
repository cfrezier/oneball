import {CONFIG} from "../browser/common/config";

export type Segment = [[number, number], [number, number]];

export type Vector = [number, number];

export class Geometry {

  static getIntersection(segment1: Segment, segment2: Segment) {
    // https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
    const s1_x = segment1[1][0] - segment1[0][0];
    const s1_y = segment1[1][1] - segment1[0][1];
    const s2_x = segment2[1][0] - segment2[0][0];
    const s2_y = segment2[1][1] - segment2[0][1];

    const s = (-s1_y * (segment1[0][0] - segment2[0][0]) + s1_x * (segment1[0][1] - segment2[0][1])) / (-s2_x * s1_y + s1_x * s2_y);
    const t = (s2_x * (segment1[0][1] - segment2[0][1]) - s2_y * (segment1[0][0] - segment2[0][0])) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
      return [segment1[0][0] + (t * s1_x), segment1[0][1] + (t * s1_y)] as Vector;
    }

    return undefined;
  }

  static limitToMax(direction: Vector, max: number): Vector {
    const directionMax = Math.max(...direction);
    if (directionMax > max) {
      return direction.map(val => val * max / directionMax) as Vector;
    }
    return direction;
  }

  static dot(v1: [number, number], v2: [number, number]) {
    return v1[0] * v2[0] + v1[1] * v2[1];
  }

  static vectorNorm(v: Vector) {
    return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2))
  }

  static reflect(direction: Vector, defenseLine: Segment) {
    // https://stackoverflow.com/questions/1243614/how-do-i-calculate-the-normal-vector-of-a-line-segment
    const normX = (2) * (defenseLine[1][0] - defenseLine[0][0]) / CONFIG.GLOBAL_WIDTH;
    const normY = (2) * (defenseLine[1][1] - defenseLine[0][1]) / CONFIG.GLOBAL_HEIGHT;
    const normal = [-normY, normX] as [number, number];

    // https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector
    // 𝑟=𝑑−2(𝑑⋅𝑛)𝑛
    return Geometry.add(Geometry.mult(-2 * Geometry.dot(direction, normal), normal), direction);
  }

  static add(v1: [number, number], v2: [number, number]): Vector {
    return [v1[0] + v2[0], v1[1] + v2[1]] as Vector;
  }

  static mult(scalar: number, vector: [number, number]) {
    return [scalar * vector[0], scalar * vector[1]] as Vector;
  }

  static getAngle(blockVector: [number, number]) {
    return -1 * ((Math.acos(Geometry.dot([0, 1], blockVector) / (Geometry.vectorNorm([0, 1]) * Geometry.vectorNorm(blockVector))) * (blockVector[0] < 0 ? -1 : 1)) - Math.PI / 2);
  }
}