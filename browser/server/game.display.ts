import {Segment, Vector} from "../../src/geometry";
import {colors} from "../../src/colors";

export class GameDisplay {
  canvas!: HTMLCanvasElement;
  debug!: HTMLDivElement;
  context!: CanvasRenderingContext2D;
  width: number = 10;
  height: number = 10;

  constructor() {
    setTimeout(() => this.init(), 100);
  }

  init() {
    this.canvas = window.document.body.querySelector(".game-canvas")!;
    this.context = this.canvas.getContext('2d')!;
    this.width = this.canvas.getBoundingClientRect().width;
    this.height = this.canvas.getBoundingClientRect().height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
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
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, ball.color);

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
      this.context.strokeStyle = ball.color;
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
    // Draw DefenseLines
    this.context.lineWidth = 1
    this.context.strokeStyle = "rgba(176, 176, 176, 0.25)";
    players.forEach(player => {
      this.context.beginPath();
      this.context.moveTo(...player.defenseLine[0]);
      this.context.lineTo(...player.defenseLine[1]);
      this.context.stroke();
    });

    // Draw blocks
    this.context.lineWidth = 3
    players.forEach(player => {
      this.context.strokeStyle = player.color;
      this.context.beginPath();
      this.context.moveTo(...player.block[0]);
      this.context.lineTo(...player.block[1]);
      this.context.stroke();
    });

    this.context.font = "18px serif";
    players.forEach(player => {
      this.context.strokeStyle = player.color;
      this.context.fillText(player.name, (player.defenseLine[1][0] + player.defenseLine[0][0]) / 2, (player.defenseLine[1][1] + player.defenseLine[0][1]) / 2);
    });
  }
}