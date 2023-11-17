export class GameDisplay {
  canvas!: HTMLCanvasElement;
  debug!: HTMLDivElement;

  constructor() {
    setTimeout(() => this.init(), 100);
  }

  init() {
    this.canvas = window.document.body.querySelector(".game-canvas")!;
    const canvasW = this.canvas.getBoundingClientRect().width;
    const canvasH = this.canvas.getBoundingClientRect().height;
    this.debug = window.document.body.querySelector(".debug-game-state")!;
  }

  display(payload: any) {
    this.debug.innerText = JSON.stringify(payload.state);
  }
}