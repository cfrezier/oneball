export default class QueueDisplay {
  _queueDiv?: HTMLDivElement;
  _timeDiv?: HTMLDivElement;

  getQueueDiv() {
    if (!this._queueDiv) {
      this._queueDiv = window.document.body.querySelector(".queue-content") ?? undefined;
    }
    return this._queueDiv!;
  }

  getTimeDiv() {
    if (!this._timeDiv) {
      this._timeDiv = window.document.body.querySelector(".queue-time") ?? undefined;
    }
    return this._timeDiv!;
  }

  update(payload: any) {
    this.getQueueDiv().innerHTML = '';

    (payload.state?.players ?? []).forEach((player: any) => {
      this.addChild(player);
    })

    this.updateTime(payload);
  }

  private addChild(player: any) {
    const node = document.createElement('p');
    node.innerText = player.name
    node.style.color = player.color;
    this.getQueueDiv()?.appendChild(node);
  }

  private updateTime(payload: any) {
    if (payload.state) {
      const toGo = this.secondsToGo(payload.state.startDate);
      this.getTimeDiv().innerText = toGo.text;
      if (toGo.continue) {
        setTimeout(() => {
          this.updateTime(payload);
        }, 1000);
      }
    }
  }

  private secondsToGo(date: string) {
    const toGo = Math.round((new Date(date).getTime() - new Date().getTime()) / 1000);
    return toGo > 0 ? {text: `Starting in ${toGo} ...`, continue: true} : {text: `Game started !`, continue: false};
  }
}