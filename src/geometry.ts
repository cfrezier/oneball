export type Segment = [[number, number], [number, number]];

export type Vector = [number, number];

export class Geometry {
  static GLOBAL_HEIGHT = 1200;
  static GLOBAL_WIDTH = 1200;

  static segmentsIntersects(s0: Segment, s1: Segment) {
    const dx0 = s0[1][0] - s0[0][0];
    const dx1 = s1[1][0] - s1[0][0];
    const dy0 = s0[1][1] - s0[0][1];
    const dy1 = s1[1][1] - s1[0][1];
    const p0 = dy1 * (s1[1][0] - s0[0][0]) - dx1 * (s1[1][1] - s0[0][1]);
    const p1 = dy1 * (s1[1][0] - s0[1][0]) - dx1 * (s1[1][1] - s0[1][1]);
    const p2 = dy0 * (s0[1][0] - s1[0][0]) - dx0 * (s0[1][1] - s1[0][1]);
    const p3 = dy0 * (s0[1][0] - s1[1][0]) - dx0 * (s0[1][1] - s1[1][1]);
    return (p0 * p1 <= 0) && (p2 * p3 <= 0)
  }

  static reflect(direction: Vector, defenseLine: Segment) {
    // https://stackoverflow.com/questions/1243614/how-do-i-calculate-the-normal-vector-of-a-line-segment
    const normX = defenseLine[1][0] - defenseLine[0][0];
    const normY = defenseLine[1][1] - defenseLine[0][1];
    const normal = [-normY, normX] as [number, number];

    // https://3dkingdoms.com/weekly/weekly.php?a=2
    // Vnew = -2*(V dot N)*N + V
    return Geometry.add(Geometry.mult(-2 * Geometry.dot(direction, normal), normal), direction);
  }

  static add(v1: [number, number], v2: [number, number]): Vector {
    return [v1[0] + v2[0], v1[1] + v2[1]] as Vector;
  }

  private static dot(direction: [number, number], normal: [number, number]) {
    return direction[0] * normal[0] + direction[1] * normal[1];
  }

  private static mult(scalar: number, vector: [number, number]) {
    return [scalar * vector[0], scalar * vector[1]] as Vector;
  }
}