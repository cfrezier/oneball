import {Player} from "./player";
import {Game} from "./game";
import {DataMsg} from "./data.message";
import {WebSocket} from "ws";

export class Queue {
  players = [] as Player[];
  game?: Game;
  currentGame?: Game;
  servers: WebSocket[] = [];

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
        }
        break;
      case 'server':
        this.servers.push(ws);
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
        this.sendToServer();
      }
    } else {
      console.log("Waiting for previous game to end...");
      this.launchGame();
    }
  }

  disconnect(ws: InstanceType<typeof WebSocket.WebSocket>) {
    this.players.find(player => player.ws === ws)?.disconnect();
    this.servers = this.servers.filter(server => server !== ws);
  }

  private sendToServer() {
    if (this.currentGame) {
      const state = JSON.stringify(this.currentGame.state());
      this.servers.forEach((wss) => wss.send(state));
    }
  }
}
