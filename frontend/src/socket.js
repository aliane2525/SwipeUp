import { io } from "socket.io-client";

const socketUrl =
  process.env.REACT_APP_SOCKET_URL ||
  window.location.origin ||
  "http://localhost:5000";

const socket = io(socketUrl, {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
