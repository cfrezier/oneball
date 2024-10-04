
export class WaitComponent {
  panel: HTMLDivElement | undefined;

  init() {
    this.panel = document.getElementsByClassName('wait')[0] as HTMLDivElement;
  }

  hide() {
    this.panel!.style.display = "none";
  }

  show() {
    this.panel!.style.display = "flex";
  }
}