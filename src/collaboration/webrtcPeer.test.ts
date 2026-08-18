import { describe, expect, it, vi } from 'vitest';
import { createPeerConnection, prepareVideoElement, requestCameraAndMicrophone } from './webrtcPeer';

describe('createPeerConnection', () => {
  it('adiciona tracks, cria oferta e encaminha ICE', async () => {
    const addTrack = vi.fn(); const close = vi.fn(); const setLocalDescription = vi.fn(async () => undefined); const createOffer = vi.fn(async () => ({ type: 'offer', sdp: 'demo' }));
    class MockPeer { onicecandidate: ((event: { candidate: RTCIceCandidate | null }) => void) | null = null; ontrack = null; onconnectionstatechange = null; connectionState = 'new' as RTCPeerConnectionState; addTrack = addTrack; close = close; setLocalDescription = setLocalDescription; createOffer = createOffer; }
    vi.stubGlobal('RTCPeerConnection', MockPeer);
    const onIceCandidate = vi.fn(); const peer = createPeerConnection({}, { onIceCandidate, onTrack: vi.fn() });
    const track = { kind: 'audio' } as MediaStreamTrack; const stream = { getTracks: () => [track] } as unknown as MediaStream;
    peer.addLocalTracks(stream); const offer = await peer.createOffer();
    (peer.connection.onicecandidate as ((event: { candidate: RTCIceCandidate | null }) => void))?.({ candidate: { candidate: 'candidate' } as RTCIceCandidate });
    expect(addTrack).toHaveBeenCalledWith(track, stream); expect(offer.type).toBe('offer'); expect(onIceCandidate).toHaveBeenCalled(); peer.close(); expect(close).toHaveBeenCalled();
  });
});

describe('media da videochamada', () => {
  it('informa quando a câmera ou o microfone já está em uso', async () => {
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: vi.fn().mockRejectedValue(new DOMException('busy', 'NotReadableError')) } });
    await expect(requestCameraAndMicrophone()).rejects.toThrow('já está sendo usado');
  });

  it('associa o stream ao vídeo e tenta iniciar a reprodução', async () => {
    const play = vi.fn(async () => undefined);
    const video = { srcObject: null, muted: false, playsInline: false, play } as unknown as HTMLVideoElement;
    const stream = { getVideoTracks: () => [{}] } as unknown as MediaStream;
    await prepareVideoElement(video, stream);
    expect(video.srcObject).toBe(stream);
    expect(video.muted).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(play).toHaveBeenCalledOnce();
  });
});
