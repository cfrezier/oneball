export class NameComponent {
  nameBtn: HTMLButtonElement | undefined;
  panel: HTMLDivElement | undefined;

  init(propagateAuth: () => void) {
    debugger;
    this.nameBtn = document.getElementById('btn-name') as HTMLButtonElement;
    this.panel = document.getElementById('panel-name') as HTMLDivElement;
    if (this.nameBtn && this.panel) {
      this.nameBtn.addEventListener('click', propagateAuth);
      this.panel.style.display = "block";
    } else {
      setTimeout(() => this.init(propagateAuth), 100);
    }
  }

  hide() {
    this.panel!.style.display = "none";
  }
}