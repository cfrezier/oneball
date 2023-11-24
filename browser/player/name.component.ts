const STORAGE_KEY = 'oneball-name';

export class NameComponent {
  nameBtn: HTMLButtonElement | undefined;
  panel: HTMLDivElement | undefined;
  input: HTMLInputElement | undefined;

  init(propagateAuth: () => void) {
    this.nameBtn = document.getElementById('btn-name') as HTMLButtonElement;
    this.panel = document.getElementById('panel-name') as HTMLDivElement;
    this.input = document.getElementById('input-name') as HTMLInputElement;
    if (this.nameBtn && this.panel && this.input) {
      this.nameBtn.addEventListener('click', propagateAuth);
      this.panel.style.display = "flex";
      this.input.value = localStorage.getItem(STORAGE_KEY) ?? '';
    } else {
      setTimeout(() => this.init(propagateAuth), 100);
    }
  }

  hide() {
    this.panel!.style.display = "none";
  }

  value() {
    localStorage.setItem(STORAGE_KEY, this.input!.value);
    return this.input!.value;
  }
}