export default class AwardDisplay {
  _awardDiv?: HTMLDivElement;
  translation = {
    mostPlayed: "Le plus actif",
    mostEfficient: "Le plus efficace",
    leastEfficient: "Le moins efficace"
  } as { [key: string]: string };
  colors = {
    mostPlayed: "#09ff00",
    mostEfficient: "#0534ff",
    leastEfficient: "#f16e6e"
  } as { [key: string]: string };

  getAwardDiv() {
    if (!this._awardDiv) {
      this._awardDiv = window.document.body.querySelector(".awards") ?? undefined;
    }
    return this._awardDiv!;
  }

  update(payload: any | undefined) {
    if (payload !== null) {
      this.getAwardDiv().innerHTML = Object.keys(payload.awards).map(key => `${this.translation[key]}: <span class="remarkable" style="background-color: ${this.colors[key]}">${payload.awards[key].name}</span>`).join('\t|\t');
    }
  }
}