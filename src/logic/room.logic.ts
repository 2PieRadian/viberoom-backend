import type { Socket } from "socket.io";
import type {
  CreateRoomData,
  Interaction,
  JoinRoomData,
} from "../lib/types.js";
import { generateRoomId, getRoomCount } from "../utils/roomUtils.js";
import { roomsStore, type Member } from "../store/rooms.store.js";

export function createRoomListener(socket: Socket) {
  socket.on("create-room", (data: CreateRoomData) => {
    console.log("🔥 create-room listener HIT");
    console.log("Process ID: ", process.pid);
    const { roomName } = data;
    const roomId = generateRoomId();

    roomsStore.set(roomId, {
      roomId,
      roomName,
      currentTime: 0,
      isPlaying: false,
      videoId: "Csy6Vd33cYI",
      members: new Map<string, Member>(),
    });

    // socket.join(roomId);

    socket.emit("create-room-success", { roomId });

    // Logs
    console.log("---------------------");
    console.log(
      "Room created: ",
      roomName,
      "roomData: ",
      roomsStore.get(roomId)
    );
    console.log("---------------------");
  });
}

export function joinRoomListener(socket: Socket) {
  socket.on("join-room", (data: JoinRoomData) => {
    console.log("Process ID: ", process.pid);
    const { roomId, username } = data;
    const room = roomsStore.get(roomId);

    if (!room) {
      socket.emit("room-not-found");
      return;
    }

    room.members.set(socket.id, { socketId: socket.id, username });
    socket.join(roomId);

    const roomState = roomsStore.get(roomId);

    const properRoomState = {
      ...roomState,
      members: Array.from(roomState?.members.values() || []),
    };

    socket.emit("join-room-success", properRoomState);

    // Notify other members about the new member
    socket.nsp.to(roomId).emit("room-state-update", properRoomState);

    // Logs
    console.log("---------------------");
    console.log(`${username} joined room: ${room.roomName}`);
    // console.log("Members: ", room.members);
    console.log("Room State : ", properRoomState);
    console.log("---------------------");
    // console.log("User joined room: ", roomId, "with members: ", room.members);
    // console.log("Total rooms: ", getRoomCount());
    // console.log("Room: ", room);
  });
}

export function leaveRoomListener(socket: Socket) {
  socket.on("leave-room", (roomId: string) => {
    console.log("Process ID: ", process.pid);
    const room = roomsStore.get(roomId);
    if (!room) return;

    room.members.delete(socket.id);
    socket.leave(roomId);
    console.log(socket.id, "left room:", roomId);

    if (room.members.size === 0) {
      roomsStore.delete(roomId);
      console.log("Room deleted as no members left:", roomId);
    }

    //Logs
    console.log("---------------------");
    console.log("User left room: ", roomId, "name: ", room.roomName);
    // console.log("Total rooms: ", getRoomCount());
    console.log("---------------------");
  });
}

export function checkRoomExistsListener(socket: Socket) {
  socket.on("check-room-exists", (roomId: string) => {
    console.log("Process ID: ", process.pid);
    const roomExists = roomsStore.has(roomId);
    socket.emit("room-exists-response", { roomId, exists: roomExists });

    // Logs
    console.log("---------------------");
    console.log("Check room exists for roomId:", roomId, "Exists:", roomExists);
    console.log("---------------------");
  });
}

export function videoIdUpdateListener(socket: Socket) {
  socket.on("video-id-updated", ({ roomId, videoId }) => {
    console.log("Process ID: ", process.pid);
    const room = roomsStore.get(roomId);

    if (!room) return;

    room.videoId = videoId;

    const properRoomState = {
      ...room,
      members: Array.from(room.members.values()),
    };

    socket.nsp.to(roomId).emit("room-state-update", properRoomState);
  });
}

export function playbackStatusUpdateListeners(socket: Socket) {
  socket.on("play-video", ({ roomId, currentTime }) => {
    // If already playing, do nothing
    if (roomsStore.get(roomId)?.isPlaying === true) return;

    const room = roomsStore.get(roomId);
    if (!room) return;
    room.isPlaying = true;
    room.currentTime = currentTime;

    const properRoomState = {
      ...room,
      members: Array.from(room.members.values()),
    };

    socket.nsp.to(roomId).emit("room-state-update", properRoomState);

    const username = room.members.get(socket.id)?.username || " ";
    socket.nsp.to(roomId).emit("interaction-update", {
      type: "play",
      time: currentTime,
      username,
    });
  });

  socket.on("pause-video", ({ roomId, currentTime }) => {
    // If already paused, do nothing
    if (roomsStore.get(roomId)?.isPlaying === false) return;

    const room = roomsStore.get(roomId);
    if (!room) return;

    room.isPlaying = false;
    room.currentTime = currentTime;

    const properRoomState = {
      ...room,
      members: Array.from(room.members.values()),
    };

    socket.nsp.to(roomId).emit("room-state-update", properRoomState);

    const username = room.members.get(socket.id)?.username || " ";
    socket.nsp.to(roomId).emit("interaction-update", {
      type: "pause",
      time: currentTime,
      username,
    });
  });

  socket.on("seek-video", ({ roomId, currentTime, username }) => {
    console.log(username, "is seeked to ", currentTime);

    const room = roomsStore.get(roomId);
    if (!room) return;

    room.currentTime = currentTime;

    socket.broadcast.to(roomId).emit("seek-video", { currentTime });

    socket.nsp.to(roomId).emit("interaction-update", {
      type: "seek",
      time: currentTime,
      username,
    });
  });

  socket.on(
    "interaction-update",
    (interaction: Interaction, roomId: string) => {
      socket.nsp.to(roomId).emit("interaction-update", interaction);
    }
  );
}
