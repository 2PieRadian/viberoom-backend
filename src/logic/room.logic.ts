import type { Socket } from "socket.io";
import type { CreateRoomData, JoinRoomData } from "../lib/types.js";
import { generateRoomId, getRoomCount } from "../utils/roomUtils.js";
import { roomsStore, type Member } from "../store/rooms.store.js";

export function createRoomListener(socket: Socket) {
  socket.on("create-room", (data: CreateRoomData) => {
    const { roomName, username } = data;
    const roomId = generateRoomId();

    roomsStore.set(roomId, {
      roomId,
      roomName,
      currentTime: 0,
      isPlaying: false,
      videoId: "",
      members: new Map<string, Member>([
        [socket.id, { socketId: socket.id, username }],
      ]),
    });

    socket.join(roomId);

    socket.emit("create-room-success", { roomId });

    const roomState = roomsStore.get(roomId);
    socket.emit("create-room-state", roomState);

    // Logs
    console.log("---------------------");
    console.log(
      "Room created: ",
      roomName,
      "with members: ",
      roomsStore.get(roomId)?.members,
      "in room: ",
      roomId
    );
    console.log("Rooms: ", roomsStore);
    console.log("Total rooms: ", getRoomCount());
    console.log("Total rooms in socket: ", socket.rooms.size);
    console.log("Socket.rooms : ", socket.rooms);
    console.log("---------------------");
  });
}

export function joinRoomListener(socket: Socket) {
  socket.on("join-room", (data: JoinRoomData) => {
    const { roomId, username } = data;
    const room = roomsStore.get(roomId);

    if (!room) {
      socket.emit("room-not-found");
      return;
    }

    room.members.set(socket.id, { socketId: socket.id, username });
    socket.join(roomId);

    socket.emit("join-room-success", { roomId });

    const roomState = roomsStore.get(roomId);

    const properRoomState = {
      ...roomState,
      members: Array.from(roomState?.members.values() || []),
    };

    // socket.emit("join-room-state", properRoomState);
    socket.nsp.to(roomId).emit("room-state-update", properRoomState);

    // Logs
    console.log("---------------------");
    console.log("User joined room: ", roomId, "name: ", room.roomName);
    console.log("Members: ", room.members);
    console.log("Total rooms: ", getRoomCount());
    console.log("Total rooms in socket: ", socket.rooms.size);
    console.log("Socket.rooms : ", socket.rooms);
    console.log("properRoomState : ", properRoomState);
    console.log("---------------------");
    // console.log("User joined room: ", roomId, "with members: ", room.members);
    // console.log("Total rooms: ", getRoomCount());
    // console.log("Room: ", room);
  });
}

export function leaveRoomListener(socket: Socket) {
  socket.on("leave-room", (roomId: string) => {
    const room = roomsStore.get(roomId);
    if (!room) return;

    room.members.delete(socket.id);
    socket.leave(roomId);
    console.log(socket.id, "left room:", roomId);

    //Logs
    console.log("---------------------");
    console.log("User left room: ", roomId, "name: ", room.roomName);
    console.log("Total rooms: ", getRoomCount());
    console.log("Total rooms in socket: ", socket.rooms.size);
    console.log("Socket.rooms : ", socket.rooms);
    console.log("---------------------");
  });
}

export function checkRoomExistsListener(socket: Socket) {
  socket.on("check-room-exists", (roomId: string) => {
    const roomExists = roomsStore.has(roomId);
    socket.emit("room-exists-response", { roomId, exists: roomExists });

    // Logs
    console.log("---------------------");
    console.log("Check room exists for roomId:", roomId, "Exists:", roomExists);
    console.log("Socket.rooms : ", socket.rooms);
    console.log("---------------------");
  });
}
