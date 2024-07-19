/**
 * TODO Handle both local and deployed case
 * (unsecure ws and wss)
 */
import {CONFIG} from "./config";

export const createWs = () => {
  return new WebSocket(CONFIG.WSS_EXTERNAL_URL);
}
