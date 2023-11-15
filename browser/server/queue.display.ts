export default class QueueDisplay {
  _queueDiv?: HTMLDivElement;
  timeNode?: HTMLParagraphElement;

  getQueueDiv() {
    if (!this._queueDiv) {
      this._queueDiv = window.document.body.querySelector(".queue-content") ?? undefined;
    }
    return this._queueDiv;
  }

  update(payload: any) {
    this.getQueueDiv()?.childNodes.forEach(node => {
      this.getQueueDiv()?.removeChild(node);
    });

    payload.state.players.forEach((player: any) => {
      this.addChild(player);
    })

    this.createTime(payload);
  }

  private addChild(player: any) {
    const node = document.createElement('p');
    node.innerText = player.name
    node.style.color = player.color;
    this.getQueueDiv()?.appendChild(node);
  }

  private createTime(payload: any) {
    this.timeNode = document.createElement('p');
    this.getQueueDiv()?.appendChild(this.timeNode);
    this.updateTime(payload);
  }

  private updateTime(payload: any) {
    const toGo = this.secondsToGo(payload.state.startDate);
    this.timeNode!.innerText = toGo.text;
    if (toGo.continue) {
      setTimeout(() => {
        this.updateTime(payload);
      }, 1000);
    }
  }

  private secondsToGo(date: string) {
    const toGo = Math.round((new Date(date).getTime() - new Date().getTime()) / 1000);
    return toGo > 0 ? {text: `Starting in ${toGo} ...`, continue: true} : {text: `Game started !`, continue: false};
  }
}