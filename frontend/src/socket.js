import { io } from "socket.io-client";

// ======================================================
// SOCKET CONNECTION
// ======================================================

const socket = io(
  process.env.REACT_APP_API_URL ||
    "http://localhost:5000",
  {
    transports: ["websocket"], // important for stability
    withCredentials: true, // needed for auth cookies later
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  }
);

export default socket;