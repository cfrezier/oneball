import {Player} from "./player";
import {Game} from "./game";
import {DataMsg} from "./data.message";
import {WebSocket} from "ws";
import * as fs from "fs";
import {Bot} from "./bot";
import {CONFIG} from "../browser/common/config";

export class Queue {
  players = [] as Player[];
  nextGame?: Game;
  currentGame?: Game;
  servers: (WebSocket | undefined)[] = [];
  path: string;
  statsPath: string;
  bots: Bot[];
  stats = {
    games: 0,
    elapsed: 0,
  }

  constructor(path: string, statsPath: string, bots = 0) {
    this.path = path;
    fs.readFile(this.path, 'utf8', (err, data) => {
      if (err) {
        console.error('No previous save. Starting with empty scores.', err);
      } else {
        this.players = JSON.parse(data).map((playerObj: Player) => Player.from(playerObj));
        console.log(`Previous save loaded, with ${this.players.length} players known.`);
      }
    });
    this.statsPath = statsPath;
    fs.readFile(this.statsPath, 'utf8', (err, data) => {
      if (err) {
        console.error('No previous stats. Starting with empty stats.', err);
      } else {
        this.stats = JSON.parse(data);
        console.log(`Previous stats loaded: ${JSON.stringify(this.stats)}`);
      }
    });
    this.bots = [];
    for (let i = 0; i < bots; i++) {
      this.bots.push(new Bot(this));
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
          player.updateRatio();
        } else {
          console.log(`Previous player ${previous.name} > ${payload.name} joined`);
          previous.name = payload.name;
          previous.connect(ws);
          this.linkBot(previous);
          previous.updateRatio();
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
          if (this.currentGame && this.currentGame.started) {
            console.log(`Player ${player.name} queuing for next game`);
            this.nextGame.apply(player);
            this.sendQueueUpdate();
          } else {
            console.log(`Player ${player.name} queuing for game about to be launched`);
            if (!!this.currentGame) {
              this.currentGame!.apply(player);
            } else {
              this.nextGame!.apply(player);
            }
            this.sendQueueUpdate();
          }
        }
        if (!!player && playerInCurrentQueue) {
          //already in queue
          player.queued();
        }
        if (!!player && playerInCurrentGame) {
          player.queued();
          player.stopWait();
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

  initGame() {
    this.currentGame = this.nextGame!;
    this.nextGame = undefined;
  }

  executeGame() {
    this.currentGame!.execute(() => {
      this.sendCurrentScoreToServer();
      this.sendHighScoreToServer();
    });
    this.sendGameToServer();
    if (!this.currentGame!.finished) {
      setTimeout(() => this.executeGame(), CONFIG.GAME_LOOP_MS);
      this.askBotInputs();
    } else {
      console.log("Game finished.");
      this.rewardAndUpdateStats();
      this.currentGame = undefined;
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

  public sendGameToServer() {
    const state = JSON.stringify({type: 'game-state', state: this.currentGame?.state()});
    this.servers.forEach((ws) => ws?.send(state));
  }

  public sendQueueUpdate() {
    const state = JSON.stringify({
      type: 'queue-state',
      state: {...this.nextGame?.state(), startDate: this.currentGame?.state().startDate}
    });
    this.servers.forEach((ws) => ws?.send(state));
  }

  private sendCurrentScoreToServer() {
    const mostPlayedTime = Math.max(...this.players.map((p) => p.time));
    const mostEfficientRatio = Math.max(...this.players.map((p) => p.ratio));
    const leastEfficientRatio = Math.min(...this.players.map((p) => p.ratio));
    const state = JSON.stringify({
      type: 'game-score',
      state: {players: (this.currentGame?.players ?? []).map(player => player.state())},
      awards: {
        mostPlayed: this.players.find(p => p.time === mostPlayedTime)?.state(),
        mostEfficient: this.players.find(p => p.ratio === mostEfficientRatio)?.state(),
        leastEfficient: this.players.find(p => p.ratio === leastEfficientRatio)?.state(),
      }
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
        console.log('Cannot save game state', err);
      }
    });
    fs.writeFile(this.statsPath, JSON.stringify(this.stats), 'utf8', (err) => {
      if (!err) {
        console.log(`State saved under ${this.statsPath}`);
      } else {
        console.log('Cannot save stats', err);
      }
    });
  }

  private linkBot(player: Player) {
    if (player?.key.indexOf("key-bot") === 0) {
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

  doneWaiting() {
    this.players.forEach(pl => pl.stopWait());
  }

  clear() {
    this.players.forEach(player => player.canQueue());
    this.nextGame!.players = [];
    this.sendQueueUpdate();
    console.log('Queue cleared');
  }

  private rewardAndUpdateStats() {
    this.stats.elapsed += this.currentGame!.reward();
    this.stats.games++;
  }
}
