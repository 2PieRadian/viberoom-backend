import crypto from "crypto";
import { roomsStore } from "../store/rooms.store.js";

export const generateRoomId = () => {
  return crypto.randomBytes(3).toString("hex");
};

export const getRoomCount = () => {
  return roomsStore.size;
};
