export default class AwardDisplay {
  _awardDiv?: HTMLDivElement;
  translation = {
    mostPlayed: "&#128548; (played++)",
    mostEfficient: "&#129297; (efficient++)",
    leastEfficient: "&#128565; (efficient--)"
  } as { [key: string]: string };

  getAwardDiv() {
    if (!this._awardDiv) {
      this._awardDiv = window.document.body.querySelector(".awards") ?? undefined;
    }
    return this._awardDiv!;
  }

  update(payload: any | undefined) {
    if (payload !== null) {
      this.getAwardDiv().innerHTML = Object.keys(payload.awards).map(key => `${this.translation[key]}: ${payload.awards[key].name}`).join('\t|\t');
    }
  }
}