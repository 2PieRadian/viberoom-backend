import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

import {
  checkRoomExistsListener,
  createRoomListener,
  joinRoomListener,
} from "../logic/room.logic.js";
import { roomsStore } from "../store/rooms.store.js";

export default function initSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: ["https://viberoom.ramanbhardwaj.me", "http://localhost:3000"],
    },
  });

  io.on("connection", (socket) => {
    console.log("\n---------------------");
    console.log("a user connected", socket.id);
    console.log("total rooms: ", roomsStore);
    console.log("Total rooms in socket: ", socket.rooms.size);
    console.log("Socket.rooms : ", socket.rooms);

    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
      console.log("Total rooms in socket: ", socket.rooms.size);
      console.log("Socket.rooms : ", socket.rooms);

      // Remove user from all rooms they were part of
      roomsStore.forEach((room, roomId) => {
        if (room.members.has(socket.id)) {
          room.members.delete(socket.id);
          socket.leave(roomId);

          const roomState = roomsStore.get(roomId);
          const properRoomState = {
            ...roomState,
            members: Array.from(roomState?.members.values() || []),
          };
          socket.nsp.to(roomId).emit("room-state-update", properRoomState);
          console.log(socket.id, "left room:", roomId);
        }
      });
    });

    createRoomListener(socket);
    joinRoomListener(socket);
    checkRoomExistsListener(socket);
  });
}
