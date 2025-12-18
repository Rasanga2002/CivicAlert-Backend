import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let ioInstance; // Singleton instance to prevent multiple initializations

export const initSocket = (server) => {
  if (ioInstance) {
    console.log("Socket.IO already initialized, returning existing instance");
    return ioInstance;
  }

  ioInstance = new Server(server, {
    cors: {
      origin: "*", // Replace with frontend URL in production
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Socket authentication middleware
  ioInstance.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error: No token provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      console.log(`User ${decoded.id} authenticated via socket`);
      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Authentication error"));
    }
  });

  // Handle socket connections
  ioInstance.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}, User: ${socket.userId}`);

    // Join user to their own room
    socket.join(socket.userId.toString());
    console.log(`User ${socket.userId} joined room: ${socket.userId}`);

    // Optional ping/pong
    socket.on("ping", () => socket.emit("pong"));

    // Handle disconnects
    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id}, User: ${socket.userId}, Reason: ${reason}`);
    });
  });

  console.log("Socket.IO initialized successfully");
  return ioInstance;
};

// Function to get the Socket.IO instance safely
export const getIO = () => {
  if (!ioInstance) throw new Error("Socket.IO not initialized");
  return ioInstance;
};
