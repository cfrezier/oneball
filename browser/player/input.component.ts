export class InputComponent {
  range: HTMLInputElement | undefined;
  panel: HTMLDivElement | undefined;

  init(ws: WebSocket, key: string) {
    this.range = document.getElementById('input') as HTMLInputElement;
    this.panel = document.getElementById('panel-input') as HTMLDivElement;
    if (this.range) {
      this.range.addEventListener("change", () => {
        ws.send(JSON.stringify({type: 'input', key, value: this.range!.value}));
      }, false);
    } else {
      setTimeout(() => this.init(ws, key), 100);
    }
  }

  show() {
    this.panel!.style.display = "block";
  }
}