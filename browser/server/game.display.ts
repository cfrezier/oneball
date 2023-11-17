import {Segment, Vector} from "../../src/geometry";
import {colors} from "../../src/colors";

export class GameDisplay {
  canvas!: HTMLCanvasElement;
  debug!: HTMLDivElement;
  context!: CanvasRenderingContext2D;

  constructor() {
    setTimeout(() => this.init(), 100);
  }

  init() {
    this.canvas = window.document.body.querySelector(".game-canvas")!;
    this.context = this.canvas.getContext('2d')!;
    const canvasW = this.canvas.getBoundingClientRect().width;
    const canvasH = this.canvas.getBoundingClientRect().height;
    this.debug = window.document.body.querySelector(".debug-game-state")!;
  }

  display(payload: any) {
    this.debug.innerText = JSON.stringify(payload.state);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBalls(payload.state.balls);
    this.drawPlayers(payload.state.players);
  }

  private drawBalls(balls: { position: Vector, color: string, size: number }[]) {
    balls.forEach((ball) => {
      const gradient = this.context.createRadialGradient(
        ball.position[0],
        ball.position[1],
        0,
        ball.position[0],
        ball.position[1],
        ball.size
      );
      gradient.addColorStop(0, ball.color);
      gradient.addColorStop(1, '#ffffff');

      this.context.beginPath();
      this.context.arc(
        ball.position[0],
        ball.position[1],
        ball.size,
        0,
        2 * Math.PI
      );
      this.context.fillStyle = gradient;
      this.context.fill();
      this.context.stroke();
    });
  }

  private drawPlayers(players: {
    name: string,
    color: string,
    defenseLine: Segment,
    size: number,
    points: number,
    total: number,
    block: Segment
  }[]) {

  }
}