import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

import { createRoomListener, joinRoomListener } from "../logic/room.logic.js";

export default function initSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    createRoomListener(socket);
    joinRoomListener(socket);
  });
}
