export class ReloadComponent {
  panel: HTMLDivElement | undefined;
  reloadBtn: HTMLButtonElement | undefined;

  init() {
    this.panel = document.getElementsByClassName('reload')[0] as HTMLDivElement;
    this.reloadBtn = document.getElementsByClassName('btn-reload')[0] as HTMLButtonElement;
    if (this.reloadBtn) {
      this.reloadBtn.addEventListener('click', () => {
        window.location.reload();
      });
    } else {
      setTimeout(() => this.init(), 100);
    }
  }

  show() {
    this.panel!.style.display = "block";
  }
}