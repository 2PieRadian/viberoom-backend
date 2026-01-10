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

    // Logs
    console.log(
      "Room created: ",
      roomName,
      "with members: ",
      roomsStore.get(roomId)?.members,
      "in room: ",
      roomId
    );
    console.log("Total rooms: ", getRoomCount());
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

    // Logs
    // console.log("User joined room: ", roomId, "with members: ", room.members);
    // console.log("Total rooms: ", getRoomCount());
    // console.log("Room: ", room);
  });
}
