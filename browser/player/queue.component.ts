export class QueueComponent {
  queueBtn: HTMLButtonElement | undefined;
  panel: HTMLDivElement | undefined;

  init(ws: WebSocket, key: string) {
    this.queueBtn = document.getElementById('queue') as HTMLButtonElement;
    this.panel = document.getElementById('panel-queue') as HTMLDivElement;
    if (this.queueBtn && this.panel) {
      this.queueBtn.addEventListener('click', () => {
        ws.send(JSON.stringify({type: 'queue', key}));
      });
    } else {
      setTimeout(() => this.init(ws, key), 100);
    }
  }

  show() {
    this.panel!.style.display = "block";
  }
}