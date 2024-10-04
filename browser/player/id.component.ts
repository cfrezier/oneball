export class IdComponent {
  panel: HTMLDivElement | undefined;

  init() {
    this.panel = document.getElementsByClassName('id')[0] as HTMLDivElement;
    if (this.panel) {
      this.panel!.innerText = `${localStorage.getItem("oneball-name")} - ${localStorage.getItem("oneball-key")}`;
    } else {
      setTimeout(() => this.init(), 100);
    }
  }

  show() {
    this.panel!.style.display = "block";
  }
}