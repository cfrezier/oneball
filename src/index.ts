import {start} from './router';
import {wss} from './wss';
import yargs from 'yargs'
import {hideBin} from "yargs/helpers";
import {CONFIG} from "../browser/common/config";

const args = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .option('msGameLoop', {
    type: 'number',
    description: 'Milliseconds between game loops'
  })
  .option('height', {
    type: 'number',
    description: 'Height in px of main drawing'
  })
  .option('width', {
    type: 'number',
    description: 'Width in px of main drawing'
  })
  .option('acceleration', {
    type: 'number',
    description: 'How quickly a ball accelerate when bouncing'
  })
  .option('maxPlayers', {
    type: 'number',
    description: 'Max number of players in a single game'
  })
  .option('minPlayers', {
    type: 'number',
    description: 'Minimum number of players in a single game'
  })
  .option('queueTime', {
    type: 'number',
    description: 'Queuing time when enough players reached'
  })
  .option('savePath', {
    type: 'string',
    description: 'Path to save and retrieve data file'
  })
  .option('bots', {
    type: 'number',
    description: 'Number of bots to spawn'
  })
  .option('port', {
    type: 'number',
    description: 'Port number for server'
  })
  .option('wssPort', {
    type: 'number',
    description: 'Port for wss server'
  })
  .option('wssExternalPort', {
    type: 'number',
    description: 'External url for wss'
  })
  .parse() as {
  msGameLoop: number;
  height: number;
  width: number;
  acceleration: number;
  maxPlayers: number;
  minPlayers: number;
  port: number;
  wssPort: number;
  queueTime: number;
  bots: number;
  savePath: string;
};

CONFIG.GAME_LOOP_MS = args.msGameLoop ?? CONFIG.GAME_LOOP_MS;
CONFIG.GLOBAL_HEIGHT = args.height ?? CONFIG.GLOBAL_HEIGHT;
CONFIG.GLOBAL_WIDTH = args.width ?? CONFIG.GLOBAL_WIDTH;
CONFIG.ACCELERATION_FACTOR = args.acceleration ?? CONFIG.ACCELERATION_FACTOR;
CONFIG.MAX_PLAYERS = args.maxPlayers ?? CONFIG.MAX_PLAYERS;
CONFIG.MIN_PLAYERS = args.minPlayers ?? CONFIG.MIN_PLAYERS;
CONFIG.QUEUE_TIME = args.queueTime ?? CONFIG.QUEUE_TIME;
CONFIG.PATH = args.savePath ?? CONFIG.PATH;
CONFIG.BOTS = args.bots ?? CONFIG.BOTS;
CONFIG.SERVER_PORT = args.port ?? CONFIG.SERVER_PORT;
CONFIG.WSS_PORT = args.wssPort ?? CONFIG.WSS_PORT;
CONFIG.WSS_EXTERNAL_URL = args.wssExternalPort ?? CONFIG.WSS_EXTERNAL_URL;
console.log(JSON.stringify(CONFIG));

const {server, router} = start();
console.log(`** Router: ${router.report}`);
console.log(`** Server address: ${server.address()}`);
console.log(`** Wss address: ${wss().address()}`);