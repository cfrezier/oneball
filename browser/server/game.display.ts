import {Segment, Vector} from "../../src/geometry";
import {colors} from "../../src/colors";

export class GameDisplay {
  canvas!: HTMLCanvasElement;
  debug?: HTMLDivElement;
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
    this.canvas.width = 1200;
    this.canvas.height = 1200;
    this.canvas.style.width = 'calc(100vw - 250px)';
    this.canvas.style.height = 'calc(100vh - 60px)';
    this.debug = window.document.body.querySelector(".debug-game-state")!;
  }

  display(payload: any) {
    if (this.debug) {
      this.debug.innerText = JSON.stringify(payload.state);
    }

    if (this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.drawBalls(payload.state.balls);
    this.drawPlayers(payload.state.players);
    //this.drawAxes();
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
      gradient.addColorStop(0, "white");
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
    if (this.context) {
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
        this.context.fillStyle = player.color;
        this.context.fillText(player.name, (player.defenseLine[1][0] + player.defenseLine[0][0]) / 2, (player.defenseLine[1][1] + player.defenseLine[0][1]) / 2);
      });
    }
  }

  private drawAxes() {
    /* Debug draw axes */
    this.context.lineWidth = 1;
    ([[[10, 10], [10, 100], 'red', 'y'], [[10, 10], [100, 10], 'orange', 'x']] as [[number, number], [number, number], string, string][]).forEach((axe: [[number, number], [number, number], string, string]) => {
      this.context.beginPath();
      this.context.strokeStyle = axe[2];
      this.context.moveTo(axe[0][0], axe[0][1]);
      this.context.lineTo(axe[1][0], axe[1][1]);
      this.context.stroke();
      this.context.fillText(axe[3], ...axe[1]);
    });
  }
}