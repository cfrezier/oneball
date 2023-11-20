import {Queue} from "./queue";

export class Simulate {
  static nbPlayers = 0;

  static someConnect(queue: Queue) {
    setTimeout(() => {
      this.randomPlayerConnect(queue);
      this.someConnect(queue);
    }, Math.random() * 2000);
  }

  static someQueue(queue: Queue) {
    setTimeout(() => {
      this.randomPlayerQueue(queue);
      this.someQueue(queue);
    }, Math.random() * 2000);
  }

  static randomPlayerConnect(queue: Queue) {
    const id = this.nbPlayers++;
    queue.processMsg({type: 'joined', name: `Joueur ${id}`, key: `key-${id}`}, undefined)
  }

  static randomPlayerQueue(queue: Queue) {
    const id = Math.round(Math.random() * this.nbPlayers);
    queue.processMsg({type: 'queue', key: `key-${id}`}, undefined);
  }

  static init(queue: Queue) {
    this.someConnect(queue);
    this.someQueue(queue);
  }
}