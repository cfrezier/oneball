import {Geometry, Segment, Vector} from "../../src/geometry";
import {CONFIG} from "../common/config";

export class GameDisplay {
  canvas!: HTMLCanvasElement;
  debug?: HTMLDivElement;
  context!: CanvasRenderingContext2D;
  size: number = 10;
  drawElement!: HTMLDivElement;

  constructor() {
    setTimeout(() => this.init(), 100);
  }

  init() {
    this.canvas = window.document.body.querySelector(".game-canvas")!;
    this.drawElement = window.document.body.querySelector("div.draw")!;
    this.context = this.canvas.getContext('2d')!;
    this.size = Math.min(this.drawElement.getBoundingClientRect().width, this.drawElement.getBoundingClientRect().height);
    this.canvas.width = CONFIG.GLOBAL_WIDTH;
    this.canvas.height = CONFIG.GLOBAL_HEIGHT;
    this.canvas.style.width = `${this.size}px`;
    this.canvas.style.height = `${this.size}px`;
    this.debug = window.document.body.querySelector(".debug-game-state")!;
  }

  previousPayload = undefined;

  display(payload: any = this.previousPayload) {
    if (this.debug) {
      this.debug.innerText = JSON.stringify(payload.state);
    }

    if (this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.previousPayload = payload;

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
        this.context.lineWidth = 15;
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
      this.context.strokeStyle = "rgb(255,255,255)";
      players.forEach(player => {
        this.context.beginPath();
        this.context.moveTo(...player.defenseLine[0]);
        this.context.lineTo(...player.defenseLine[1]);
        this.context.stroke();
      });

      // Draw blocks
      players.forEach(player => {
        this.context.strokeStyle = player.color;
        this.context.lineWidth = 25;
        this.context.lineCap = "round";
        this.context.beginPath();
        this.context.moveTo(...player.block[0]);
        this.context.lineTo(...player.block[1]);
        this.context.stroke();
      });

      this.context.font = "48px Arial";
      players.forEach(player => {
        this.context.save();
        this.context.translate((player.defenseLine[1][0] + player.defenseLine[0][0]) / 2, (player.defenseLine[1][1] + player.defenseLine[0][1]) / 2);
        const blockVector = [player.block[1][0] - player.block[0][0], player.block[1][1] - player.block[0][1]] as Vector;
        const angle = Geometry.getAngle(blockVector);
        const additionnalAngle = (player.defenseLine[1][0] < player.defenseLine[0][0]) ? Math.PI : 0;
        this.context.rotate(angle + additionnalAngle);
        this.context.translate(0, additionnalAngle !== 0 ? 60 : -20);
        const nameLength = this.context.measureText(player.name);
        this.context.translate(-nameLength.width / 2, 0);
        this.context.fillStyle = player.color;
        this.context.fillText(player.name, 0, 0);
        this.context.restore();
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
      const timeToStart = (new Date(payload.state.startDate).getTime() - new Date().getTime()) / 1000;
      const seconds = Math.ceil(timeToStart);
      const progress = timeToStart - Math.ceil(timeToStart);
      if (!isNaN(seconds) && seconds > 0) {
        const tmp = this.canvas.style.backgroundImage;
        this.canvas.style.backgroundImage = 'none';
        const fontSize = Math.round(400 * (1 - progress));
        this.context.font = `${fontSize}px serif`;
        this.context.fillStyle = '#009EDF';
        this.context.fillText(`${seconds}`, (CONFIG.GLOBAL_WIDTH - fontSize / 2) / 2, (CONFIG.GLOBAL_HEIGHT + fontSize / 2) / 2);
        setTimeout(() => {
          this.display();
        }, 10);
      } else {
        this.canvas.style.backgroundImage = "url('./img/onepoint.png')";
      }
    }
  }
}