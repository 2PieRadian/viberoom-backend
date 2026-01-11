import type { Member } from "../store/rooms.store.js";

export interface CreateRoomData {
  roomName: string;
  username: string;
}

export interface JoinRoomData {
  roomId: string;
  username: string;
}

export interface RoomData {
  roomId: string;
  roomName: string;
  currentTime: number;
  isPlaying: boolean;
  videoId: string;
  members: Member[];
}
