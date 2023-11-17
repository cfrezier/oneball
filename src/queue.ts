import {Player} from "./player";
import {Game} from "./game";
import {DataMsg} from "./data.message";
import {WebSocket} from "ws";

export const GAME_LOOP_MS = 50;

export class Queue {
  players = [] as Player[];
  nextGame?: Game;
  currentGame?: Game;
  servers: (WebSocket | undefined)[] = [];
  started = false;

  mock() {
    setTimeout(() => this.processMsg({type: 'joined', name: 'Joueur 1', key: 'key-1'}, undefined), 1000);
    setTimeout(() => this.processMsg({type: 'joined', name: 'Joueur 2', key: 'key-2'}, undefined), 1500);
    setTimeout(() => this.processMsg({type: 'joined', name: 'Joueur 3', key: 'key-3'}, undefined), 2000);
    setTimeout(() => this.processMsg({type: 'joined', name: 'Joueur 4', key: 'key-4'}, undefined), 3000);
    setTimeout(() => this.processMsg({type: 'joined', name: 'Joueur 5', key: 'key-5'}, undefined), 10000);
    setTimeout(() => this.processMsg({type: 'queue', key: 'key-4'}, undefined), 4000);
    setTimeout(() => this.processMsg({type: 'queue', key: 'key-2'}, undefined), 5000);
    setTimeout(() => this.processMsg({type: 'queue', key: 'key-1'}, undefined), 6000);
    setTimeout(() => this.processMsg({type: 'queue', key: 'key-5'}, undefined), 15000);
  }

  processMsg(payload: DataMsg, ws?: WebSocket) {
    switch (payload.type) {
      case 'joined':
        const previous = this.players.find((player) => payload.key === player.key);
        if (!previous) {
          const player = new Player(payload.name, payload.key);
          this.players.push(player);
          ws?.send(
            JSON.stringify({
              type: 'key',
              payload: {
                key: player.key
              }
            })
          );
          player.connect(ws);
          console.log(`New player ${player.name} joined`);
        } else {
          console.log(`Previous player ${previous.name} > ${payload.name} joined`);
          previous.name = payload.name;
          previous.connect(ws);
        }
        this.sendHighScoreToServer();
        break;
      case 'queue':
        if (!this.nextGame) {
          console.log(`Creating next game`);
          this.nextGame = new Game(this);
        }
        const playerQueue = this.players.find((player) => payload.key === player.key);
        if (!!playerQueue) {
          console.log(`Player ${playerQueue.name} queuing for next game`);
          this.nextGame.apply(playerQueue);
          this.sendQueueUpdate();
        }
        break;
      case 'input':
        const playerInput = this.players.find((player) => payload.key === player.key);
        if (!!playerInput) {
          playerInput.move(payload.input)
        }
        break;
      case 'server':
        this.servers.push(ws);
        this.sendQueueUpdate();
        this.sendGameToServer();
        this.sendHighScoreToServer();
        break;
    }
  }

  launchGame() {
    if (!this.currentGame) {
      this.currentGame = this.nextGame!;
      this.nextGame = undefined;
      this.currentGame.init();
      this.executeGame();
    } else {
      console.log("Waiting for previous game to end...");
      setTimeout(() => this.launchGame(), 1000);
    }
  }

  executeGame() {
    this.currentGame!.execute();
    this.sendGameToServer();
    if (!this.currentGame!.finished) {
      setTimeout(() => this.executeGame(), GAME_LOOP_MS);
      this.sendCurrentScoreToServer();
      this.sendHighScoreToServer();
    } else {
      console.log("Game finished.");
      this.currentGame!.reward();
      this.currentGame = undefined;
      this.sendCurrentScoreToServer();
      this.sendHighScoreToServer();
    }
  }

  disconnect(ws: InstanceType<typeof WebSocket.WebSocket>) {
    this.players.find(player => player.ws === ws)?.disconnect();
    this.servers = this.servers.filter(server => server !== ws);
  }

  private sendGameToServer() {
    if (this.currentGame) {
      const state = JSON.stringify({type: 'game-state', state: this.currentGame.state()});
      this.servers.forEach((ws) => ws?.send(state));
    }
  }

  private sendQueueUpdate() {
    const state = JSON.stringify({type: 'queue-state', state: this.nextGame?.state()});
    this.servers.forEach((ws) => ws?.send(state));
  }

  private sendCurrentScoreToServer() {
    const state = JSON.stringify({
      type: 'game-score',
      state: {players: (this.currentGame?.players ?? []).map(player => player.state())}
    });
    this.servers.forEach((ws) => ws?.send(state));
  }

  private sendHighScoreToServer() {
    const state = JSON.stringify({type: 'score-state', state: this.state()});
    this.servers.forEach((ws) => ws?.send(state));
  }

  private state() {
    const list = [...this.players.map(player => player.state())];
    list.sort((p1, p2) => p2.total - p1.total);
    return {players: list.slice(0, 10)};
  }
}
