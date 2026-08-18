import { MediaRequestError } from './callTypes';

export type PeerCallbacks = {
  onIceCandidate: (candidate: RTCIceCandidate) => void;
  onTrack: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
};

export type WebRtcPeer = {
  addLocalTracks: (stream: MediaStream) => void;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  acceptOffer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>;
  acceptAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  replaceVideoTrack: (track: MediaStreamTrack) => Promise<void>;
  close: () => void;
  connection: RTCPeerConnection;
};

export function createPeerConnection(config: RTCConfiguration, callbacks: PeerCallbacks): WebRtcPeer {
  const connection = new RTCPeerConnection(config);
  connection.onicecandidate = (event) => { if (event.candidate) callbacks.onIceCandidate(event.candidate); };
  connection.ontrack = (event) => { const stream = event.streams[0]; if (stream) callbacks.onTrack(stream); };
  connection.onconnectionstatechange = () => callbacks.onConnectionStateChange?.(connection.connectionState);
  return {
    connection,
    addLocalTracks: (stream) => stream.getTracks().forEach((track) => connection.addTrack(track, stream)),
    createOffer: async () => { const offer = await connection.createOffer(); await connection.setLocalDescription(offer); return offer; },
    acceptOffer: async (offer) => { await connection.setRemoteDescription(offer); const answer = await connection.createAnswer(); await connection.setLocalDescription(answer); return answer; },
    acceptAnswer: async (answer) => { await connection.setRemoteDescription(answer); },
    addIceCandidate: async (candidate) => { await connection.addIceCandidate(candidate); },
    replaceVideoTrack: async (track) => { const sender = connection.getSenders().find((item) => item.track?.kind === 'video'); if (sender) await sender.replaceTrack(track); },
    close: () => { connection.close(); },
  };
}

export async function prepareVideoElement(element: HTMLVideoElement, stream: MediaStream, mute = true): Promise<void> {
  element.srcObject = stream;
  element.muted = mute;
  element.playsInline = true;
  element.onloadedmetadata = () => { void element.play().catch(() => undefined); };
  try { await element.play(); } catch { /* o navegador pode aguardar uma interação do usuário */ }
}

export async function requestCameraAndMicrophone(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) throw new MediaRequestError('unsupported', 'Este navegador não oferece câmera e microfone.');
  try { return await navigator.mediaDevices.getUserMedia({ video: true, audio: { echoCancellation: true, noiseSuppression: true } }); }
  catch (error) { const name = error instanceof DOMException ? error.name : ''; if (name === 'NotAllowedError' || name === 'PermissionDeniedError') throw new MediaRequestError('permission-denied', 'Permita a câmera e o microfone para entrar na chamada.'); if (name === 'NotFoundError') throw new MediaRequestError('device-unavailable', 'Nenhuma câmera ou microfone disponível.'); if (name === 'NotReadableError' || name === 'AbortError') throw new MediaRequestError('unknown', 'A câmera ou o microfone já está sendo usado por outro aplicativo.'); if (name === 'OverconstrainedError') throw new MediaRequestError('unknown', 'A câmera selecionada não atende aos requisitos do navegador.'); if (name === 'SecurityError') throw new MediaRequestError('unknown', 'O navegador bloqueou o acesso à câmera. Verifique as permissões deste site.'); throw new MediaRequestError('unknown', 'Não foi possível iniciar câmera e microfone.'); }
}

export async function requestScreenShare(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getDisplayMedia) throw new MediaRequestError('unsupported', 'Este navegador não oferece compartilhamento de tela.');
  try { return await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false }); }
  catch (error) { const name = error instanceof DOMException ? error.name : ''; if (name === 'NotAllowedError' || name === 'PermissionDeniedError') throw new MediaRequestError('permission-denied', 'O compartilhamento de tela foi cancelado.'); throw new MediaRequestError('unknown', 'Não foi possível compartilhar a tela.'); }
}
