export const createWs = () => {
  return new WebSocket(window.location.toString().replace("http://", "ws://").replace(location.port, "8001"));
}