/**
 * TODO Handle both local and deployed case
 * (unsecure ws and wss)
 */

export const createWs = () => {
    return new WebSocket(window.location.toString()
        .replace("https://", "wss://wss.")
    );
}