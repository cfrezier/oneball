import {Player} from "./player";
import {Game} from "./game";
import {DataMsg} from "./data.message";
import {WebSocket} from "ws";
import * as fs from "fs";
import {Bot} from "./bot";

export const GAME_LOOP_MS = 10;

export class Queue {
  players = [] as Player[];
  nextGame?: Game;
  currentGame?: Game;
  servers: (WebSocket | undefined)[] = [];
  path: string;
  bots: Bot[];

  constructor(path: string, bots = 0) {
    this.path = path;
    fs.readFile(this.path, 'utf8', (err, data) => {
      if (err) {
        console.error('Cannont initialize', err);
      } else {
        this.players = JSON.parse(data).map((playerObj: Player) => Player.from(playerObj));
      }
    });
    this.bots = [];
    for (let i = 0; i < bots; i++) {
      this.bots.push(new Bot(this))
    }
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
          this.linkBot(player);
        } else {
          console.log(`Previous player ${previous.name} > ${payload.name} joined`);
          previous.name = payload.name;
          previous.connect(ws);
          this.linkBot(previous);
        }
        this.sendHighScoreToServer();
        break;
      case 'queue':
        if (!this.nextGame) {
          console.log(`Creating next game`);
          this.nextGame = new Game(this);
        }
        const player = this.players.find((player) => payload.key === player.key);
        const playerInCurrentGame = this.currentGame?.players.find((player) => payload.key === player.key);
        const playerInCurrentQueue = this.nextGame?.players.find((player) => payload.key === player.key);

        if (!playerInCurrentGame && !playerInCurrentQueue && !!player) {
          console.log(`Player ${player.name} queuing for next game`);
          this.nextGame.apply(player);
          this.sendQueueUpdate();
        }
        break;
      case 'input':
        const playerInput = this.players.find((player) => payload.key === player.key);
        if (!!playerInput) {
          //console.log('input', payload);
          playerInput.move(payload)
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
      this.askBotInputs();
    } else {
      console.log("Game finished.");
      this.currentGame!.reward();
      this.currentGame = undefined;
      this.sendCurrentScoreToServer();
      this.sendHighScoreToServer();
      this.sendGameToServer();
      this.sendQueueUpdate();
      this.asyncSave();
      this.askBotsToQueue();
    }
  }

  disconnect(ws: InstanceType<typeof WebSocket.WebSocket>) {
    this.players.find(player => player.ws === ws)?.disconnect();
    this.servers = this.servers.filter(server => server !== ws);
  }

  private sendGameToServer() {
    const state = JSON.stringify({type: 'game-state', state: this.currentGame?.state()});
    this.servers.forEach((ws) => ws?.send(state));
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

  private asyncSave() {
    fs.writeFile(this.path, JSON.stringify(this.players.map(player => player.serializable())), 'utf8', (err) => {
      if (!err) {
        console.log(`State saved under ${this.path}`);
      } else {
        console.log('Cannot save', err);
      }
    });
  }

  private linkBot(player: Player) {
    if(player?.key.indexOf("key-bot") === 0) {
        const bot = this.bots.find(bot => bot.key === player.key);
        bot?.link(player);
    }
  }

  private askBotsToQueue() {
    this.bots.forEach(bot => bot.queue(this));
  }

  private askBotInputs() {
    this.bots.forEach(bot => bot.newInput(this.currentGame!, this));
  }
}
