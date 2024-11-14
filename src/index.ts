import {start} from './router';
import {wss} from './wss';
import {CONFIG} from "../browser/common/config";
import * as fs from "fs";

try {
  const config = JSON.parse(fs.readFileSync('./static/config.json', {encoding: 'utf8', flag: 'r'}));
  console.log('loaded config', config);

  CONFIG.GAME_LOOP_MS = config.GAME_LOOP_MS ?? CONFIG.GAME_LOOP_MS;
  CONFIG.GLOBAL_HEIGHT = config.GLOBAL_HEIGHT ?? CONFIG.GLOBAL_HEIGHT;
  CONFIG.GLOBAL_WIDTH = config.GLOBAL_WIDTH ?? CONFIG.GLOBAL_WIDTH;
  CONFIG.ACCELERATION_FACTOR = config.ACCELERATION_FACTOR ?? CONFIG.ACCELERATION_FACTOR;
  CONFIG.MAX_PLAYERS = config.MAX_PLAYERS ?? CONFIG.MAX_PLAYERS;
  CONFIG.MIN_PLAYERS = config.MIN_PLAYERS ?? CONFIG.MIN_PLAYERS;
  CONFIG.QUEUE_TIME = config.QUEUE_TIME ?? CONFIG.QUEUE_TIME;
  CONFIG.PATH = config.PATH ?? CONFIG.PATH;
  CONFIG.STATS_PATH = config.STATS_PATH ?? CONFIG.STATS_PATH;
  CONFIG.BOTS = config.BOTS ?? CONFIG.BOTS;
  CONFIG.SERVER_PORT = config.SERVER_PORT ?? CONFIG.SERVER_PORT;
  CONFIG.WSS_PORT = config.WSS_PORT ?? CONFIG.WSS_PORT;
  CONFIG.WSS_EXTERNAL_URL = config.WSS_EXTERNAL_URL ?? CONFIG.WSS_EXTERNAL_URL;
  console.log('final config: ', JSON.stringify(CONFIG));

  const {server, router} = start();
  console.log(`** Router: ${router.report}`);
  console.log(`** Server address: ${server.address()}`);
  console.log(`** Wss address: ${wss().address()}`);
} catch (e) {
  console.error('Wrong start', e);
}
