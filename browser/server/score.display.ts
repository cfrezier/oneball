export class ScoreDisplay {
  _scoreDiv?: HTMLDivElement;
  _highscoreDiv?: HTMLDivElement;

  getScoreDiv() {
    if (!this._scoreDiv) {
      this._scoreDiv = window.document.body.querySelector(".score-content") ?? undefined;
    }
    return this._scoreDiv!;
  }

  getHighscoreDiv() {
    if (!this._highscoreDiv) {
      this._highscoreDiv = window.document.body.querySelector(".highscore-content") ?? undefined;
    }
    return this._highscoreDiv!;
  }

  updateScore(payload: any) {
    this.getScoreDiv().innerHTML = "";

    (payload.state?.players ?? []).forEach((player: any) => {
      this.addScore(player, this.getScoreDiv(), 'points');
    });
  }

  updateHighScore(payload: any) {
    this.getHighscoreDiv().innerHTML = "";

    (payload.state?.players ?? []).forEach((player: any) => {
      this.addScore(player, this.getHighscoreDiv(), 'total');
    });
  }

  private addScore(player: any, to: HTMLDivElement, type: 'total' | 'points') {
    const node = document.createElement('div');
    node.classList.add('score-item');
    const playerName = document.createElement('p');
    playerName.innerText = player.name;
    playerName.title = player.key;
    const playerValue = document.createElement('p');
    playerValue.innerText = player[type];
    node.appendChild(playerName);
    node.appendChild(playerValue);
    to?.appendChild(node);
  }
}