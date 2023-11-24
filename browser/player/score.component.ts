
export class ScoreComponent {
  panel: HTMLDivElement | undefined;

  init() {
    this.panel = document.getElementById('panel-score') as HTMLDivElement;
    if (this.panel) {
      this.panel.style.display = "flex";
    } else {
      setTimeout(() => this.init(), 100);
    }
  }

  hide() {
    this.panel!.style.display = "none";
  }

  display(score: number) {
    this.panel!.style.display = "flex";
    this.panel!.innerText = `${score} points`;
  }
}