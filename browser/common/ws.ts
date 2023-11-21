export const createWs = () => {
  return new WebSocket(window.location.toString().replace("http://", "ws://").replace("8002", "8001"));
}