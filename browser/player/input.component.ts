export class InputComponent {
  range: HTMLInputElement | undefined;
  panel: HTMLDivElement | undefined;
  label: HTMLDivElement | undefined;

  init(ws: WebSocket, key: string) {
    this.range = document.getElementById('input') as HTMLInputElement;
    this.panel = document.getElementById('panel-input') as HTMLDivElement;
    this.label = document.getElementById('player-label') as HTMLDivElement;
    if (this.range && this.label && this.panel) {
      this.hide();
      this.range.addEventListener("input", () => {
        ws.send(JSON.stringify({type: 'input', key, input: this.range!.value}));
      }, false);
    } else {
      setTimeout(() => this.init(ws, key), 100);
    }
  }

  show(color: string, name: string) {
    this.panel!.style.display = "flex";
    this.label!.style.backgroundColor = color;
    this.label!.innerText = name;
  }

  hide() {
    this.panel!.style.display = "none";
  }
}