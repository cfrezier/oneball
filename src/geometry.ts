export type Segment = [[number, number], [number, number]];

export type Vector = [number, number];

export class Geometry {
  static GLOBAL_HEIGHT = 1200;
  static GLOBAL_WIDTH = 1200;

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
}