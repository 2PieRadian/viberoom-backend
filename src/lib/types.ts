import type { Member } from "../store/rooms.store.js";

export interface CreateRoomData {
  roomName: string;
  username: string;
}

export interface JoinRoomData {
  roomId: string;
  username: string;
}

export interface Interaction {
  type: "play" | "pause" | "seek";
  time: number;
  username: string;
}
