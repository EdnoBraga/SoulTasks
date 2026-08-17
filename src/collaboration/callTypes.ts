export type CallRoomStatus = 'active' | 'ended';

export type CallRoom = {
  id: string;
  workspaceId: string;
  initiatorId: string;
  status: CallRoomStatus;
  createdAt: string;
  endedAt?: string;
};

export type CallParticipant = {
  roomId: string;
  userId: string;
  displayName: string;
  joinedAt: string;
  leftAt?: string;
  active: boolean;
};

export type CallSignal =
  | { type: 'offer'; from: string; to: string; description: RTCSessionDescriptionInit }
  | { type: 'answer'; from: string; to: string; description: RTCSessionDescriptionInit }
  | { type: 'ice-candidate'; from: string; to: string; candidate: RTCIceCandidateInit };

export type MediaErrorCode = 'unsupported' | 'permission-denied' | 'device-unavailable' | 'unknown';

export class MediaRequestError extends Error {
  constructor(public readonly code: MediaErrorCode, message: string) { super(message); }
}
