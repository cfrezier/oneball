import {Player} from "./player";
import {Game} from "./game";
import {DataMsg} from "./data.message";
import {WebSocket} from "ws";

export class Queue {
  players = [new Player('a'), new Player('b')] as Player[];
  game?: Game;
  currentGame?: Game;
  servers: WebSocket[] = [];

  mock() {
    this.players = [new Player('a'), new Player('b')] as Player[];
    this.currentGame = new Game(this);
    this.currentGame.apply(this.players[0]);
    this.currentGame.apply(this.players[1]);
  }

  processMsg(payload: DataMsg, ws: WebSocket): Player | null {
    let player = null;

    switch (payload.type) {
      case 'joined':
        const previous = this.players.find((player) => payload.key === player.key);
        if (!previous) {
          player = new Player(payload.name);
          this.players.push(player);
          ws.send(
            JSON.stringify({
              type: 'key',
              payload: {
                key: player.key
              }
            })
          );
        } else {
          player = previous;
          player.name = payload.name;
        }
        player.connect(ws);
        break;
      case 'queue':
        if (!this.game) {
          this.game = new Game(this);
        }
        if (!!player) {
          this.game.apply(player);
          this.sendQueueUpdate();
        }
        break;
      case 'server':
        this.servers.push(ws);
        this.sendQueueUpdate();
        this.sendGameToServer();
        this.sendHighScoreToServer();
        break;
    }

    return player;
  }

  launchGame() {
    if (this.currentGame === null) {
      this.currentGame = this.game!;
      this.game = undefined;
      this.currentGame.init();
      while (!this.currentGame.finished) {
        this.currentGame.execute();
        this.sendGameToServer();
      }
      this.sendHighScoreToServer();
    } else {
      console.log("Waiting for previous game to end...");
      setTimeout(() => this.launchGame(), 1000);
    }
  }

  disconnect(ws: InstanceType<typeof WebSocket.WebSocket>) {
    this.players.find(player => player.ws === ws)?.disconnect();
    this.servers = this.servers.filter(server => server !== ws);
  }

  private sendGameToServer() {
    if (this.currentGame) {
      const state = JSON.stringify({type: 'game-state', state: this.currentGame.state()});
      this.servers.forEach((wss) => wss.send(state));
    }
  }

  private sendQueueUpdate() {
    const state = JSON.stringify({type: 'queue-state', state: this.currentGame?.state()});
    this.servers.forEach((wss) => wss.send(state));
  }

  private sendHighScoreToServer() {
    const state = JSON.stringify({type: 'score-state', state: this.state()});
    this.servers.forEach((wss) => wss.send(state));
    return this.state();
  }

  private state() {
    return {players: [...this.players.map(player => player.state())].sort((p1, p2) => p1.total - p2.total)};
  }
}
