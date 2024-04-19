import {Geometry, Segment, Vector} from "../../src/geometry";

export class GameDisplay {
  canvas!: HTMLCanvasElement;
  debug?: HTMLDivElement;
  context!: CanvasRenderingContext2D;
  size: number = 10;

  constructor() {
    setTimeout(() => this.init(), 100);
  }

  init() {
    this.canvas = window.document.body.querySelector(".game-canvas")!;
    this.context = this.canvas.getContext('2d')!;
    this.size = Math.min(this.canvas.getBoundingClientRect().width, this.canvas.getBoundingClientRect().height);
    this.canvas.width = Geometry.GLOBAL_WIDTH;
    this.canvas.height = Geometry.GLOBAL_HEIGHT;
    this.canvas.style.width = `${this.size}px`;
    this.canvas.style.height = `${this.size}px`;
    this.debug = window.document.body.querySelector(".debug-game-state")!;
  }

  display(payload: any) {
    if (this.debug) {
      this.debug.innerText = JSON.stringify(payload.state);
    }

    if (this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.drawCounter(payload);
    this.drawBalls(payload.state.balls);
    this.drawPlayers(payload.state.players);
    //this.drawAxes();
  }

  private drawBalls(balls: { position: Vector, color: string, size: number }[]) {
    balls.forEach((ball) => {
      if (this.context) {
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
      }
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
      this.context.strokeStyle = "rgba(224,224,224,0.5)";
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
        this.context.lineWidth = 5;
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

  private drawCounter(payload: any) {
    if (this.context) {
      const value = Math.round((new Date(payload.state.startDate).getTime() - new Date().getTime()) / 1000);
      if (!isNaN(value) && value > 0) {
        this.context.font = "64px serif";
        this.context.fillStyle = '#FFFFFF';
        this.context.fillText(`${value}`, Geometry.GLOBAL_WIDTH / 2, Geometry.GLOBAL_HEIGHT / 2);
        setTimeout(() => {
          this.display(payload);
        }, 100);
      }
    }
  }
}