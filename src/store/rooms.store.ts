export interface Member {
  socketId: string;
  username: string;
}

export interface Room {
  roomId: string;
  roomName: string;
  members: Map<string, Member>;

  // Video Specific Fields
  videoId: string;
  isPlaying: boolean;
  currentTime: number;
}

export const roomsStore = new Map<string, Room>();
