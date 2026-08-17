# Video Calls and Screen Sharing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add on-demand open call rooms for the three authenticated SoulFork workspace members, with camera, microphone, and screen sharing.

**Architecture:** Supabase Realtime will carry private room signaling messages while WebRTC carries media directly between participants. Durable room and participant state will be stored in RLS-protected tables. A TURN provider will be configured before production use.

**Tech Stack:** React 19, TypeScript, Supabase Realtime, Supabase Postgres, WebRTC `RTCPeerConnection`, `getUserMedia`, `getDisplayMedia`, Vitest, Playwright.

## Global Constraints

- Only authenticated active workspace members may see or join a room.
- Any member may start or join an active room without approval.
- Maximum of three participants in the first version.
- No audio or video streams are persisted.
- Camera, microphone, and screen permissions are requested only on user action.
- TURN credentials remain in Supabase secrets or a server-side broker.
- The original SoulFork website is not modified.
- Recorded meetings require an explicit “OK” confirmation before entry.
- Meeting output is a concise speaker-attributed summary, not a verbatim transcript.
- Minutes are viewable in the dashboard and exportable as PDF or HTML.

## File Map

- Create `supabase/migrations/20260818100000_call_rooms.sql`: room and participant tables with RLS.
- Create `src/collaboration/callTypes.ts`: room, participant, signaling, and media state types.
- Create `src/collaboration/webrtcPeer.ts`: one peer connection lifecycle and track management.
- Create `src/collaboration/callRoom.ts`: room presence, signaling, participant cap, and teardown.
- Create `src/components/CallRoom.tsx`: call overlay, participant tiles, controls, and screen sharing.
- Create `src/components/MeetingConsent.tsx`: mandatory recording/transcription notice before entry.
- Create `src/components/MeetingMinutes.tsx`: summarized speaker-attributed minutes with PDF/HTML export.
- Create `src/collaboration/meetingMinutes.ts`: transcription finalization and summary generation contract.
- Create `src/collaboration/webrtcPeer.test.ts`: peer lifecycle tests with mocked browser APIs.
- Create `src/collaboration/callRoom.test.ts`: signaling and room cleanup tests.
- Create `src/components/CallRoom.test.tsx`: permissions, controls, and join/leave UI tests.
- Modify `src/App.tsx`: active-room banner and call overlay.
- Modify `src/styles/global.css`: call grid, active room banner, and permission/error states.
- Modify `src/App.tsx`: meeting-minutes navigation and meeting history.
- Modify `src/styles/global.css`: consent dialog, minutes list, minutes viewer, and export actions.
- Modify `docs/PRIVATE-WORKSPACE-SETUP.md`: TURN setup and browser permission checklist.

## Task 1: Add room and participant schema

**Files:**
- Create: `supabase/migrations/20260818100000_call_rooms.sql`

- [ ] **Step 1: Generate the migration**

Run: `supabase migration new call_rooms`

- [ ] **Step 2: Create durable tables**

Create `call_rooms` with UUID ID, workspace ID, initiator ID, `status` (`active` or `ended`), and timestamps. Create `call_participants` with room/user composite uniqueness, joined/left timestamps, and active state. Add indexes for active rooms by workspace.

- [ ] **Step 3: Add RLS**

Allow active workspace members to select active rooms and participants, insert their own participant row, and update only their own leave state. Allow the initiator to end the room. Keep signaling payloads in Realtime, not in Postgres.

- [ ] **Step 4: Apply and verify**

Apply the migration through the Supabase SQL/MCP path, inspect policies and grants, and run security advisors.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations
git commit -m "feat: add call room persistence"
```

## Task 2: Implement WebRTC peer lifecycle

**Files:**
- Create: `src/collaboration/callTypes.ts`
- Create: `src/collaboration/webrtcPeer.ts`
- Test: `src/collaboration/webrtcPeer.test.ts`

**Interfaces:**
- `createPeerConnection(config, callbacks): WebRtcPeer`.
- `WebRtcPeer.addLocalTracks(stream): void`.
- `WebRtcPeer.createOffer(): Promise<RTCSessionDescriptionInit>`.
- `WebRtcPeer.acceptOffer(offer): Promise<RTCSessionDescriptionInit>`.
- `WebRtcPeer.acceptAnswer(answer): Promise<void>`.
- `WebRtcPeer.addIceCandidate(candidate): Promise<void>`.
- `WebRtcPeer.close(): void`.

- [ ] **Step 1: Write failing lifecycle tests**

Mock `RTCPeerConnection` and assert local tracks are added, offers/answers are created, ICE callbacks are emitted, remote tracks reach the callback, and `close()` stops owned tracks and releases the connection.

- [ ] **Step 2: Implement the peer wrapper**

Keep browser API details inside `webrtcPeer.ts`. Use the configured STUN/TURN list, forward signaling events through callbacks, and never log SDP or ICE credentials.

- [ ] **Step 3: Add media helpers**

Implement `requestCameraAndMicrophone()` using `navigator.mediaDevices.getUserMedia` and `requestScreenShare()` using `getDisplayMedia`. Return clear error categories for permission denied, device unavailable, and unsupported browser.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- --run src/collaboration/webrtcPeer.test.ts`

Expected: PASS with no real camera or microphone required.

- [ ] **Step 5: Commit**

```bash
git add src/collaboration/callTypes.ts src/collaboration/webrtcPeer.ts src/collaboration/webrtcPeer.test.ts
git commit -m "feat: add WebRTC peer lifecycle"
```

## Task 3: Implement open room signaling and participant cap

**Files:**
- Create: `src/collaboration/callRoom.ts`
- Test: `src/collaboration/callRoom.test.ts`

**Interfaces:**
- `createCallRoom(workspaceId, session): Promise<CallRoom>`.
- `joinCallRoom(roomId, session): Promise<CallParticipant[]>`.
- `leaveCallRoom(roomId, session): Promise<void>`.
- `subscribeToCallRoom(roomId, session, callbacks): Promise<() => void>`.
- `endCallRoom(roomId, session): Promise<void>`.

- [ ] **Step 1: Write failing room tests**

Cover room creation, joining the second and third participant, rejecting a fourth participant, forwarding offer/answer/ICE messages only inside the room, idempotent leave, and initiator-only ending.

- [ ] **Step 2: Implement durable room calls**

Use the collaboration API pattern for room creation and participant state. Treat a room as active only while its status is active and its participant count is below three.

- [ ] **Step 3: Implement private Realtime signaling**

Join a room-specific private Realtime channel, include only the authenticated user’s session identity in signaling metadata, and clean up the channel on leave, end, or component unmount.

- [ ] **Step 4: Connect peer events**

Create one peer wrapper per remote participant, route offers/answers/candidates to the correct peer ID, and remove a peer when the participant leaves.

- [ ] **Step 5: Run focused tests**

Run: `npm test -- --run src/collaboration/callRoom.test.ts`

Expected: PASS with mocked Supabase channel and WebRTC objects.

- [ ] **Step 6: Commit**

```bash
git add src/collaboration/callRoom.ts src/collaboration/callRoom.test.ts
git commit -m "feat: add open call room signaling"
```

## Task 4: Build the call room interface

**Files:**
- Create: `src/components/CallRoom.tsx`
- Test: `src/components/CallRoom.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- `CallRoom` receives `room`, `participants`, `localStream`, `remoteStreams`, and callbacks `onToggleMicrophone`, `onToggleCamera`, `onShareScreen`, `onLeave`, and `onEnd`.

- [ ] **Step 1: Write component tests**

Assert that active rooms show “Entrar na chamada”, a joined room shows participant tiles, camera/microphone buttons reflect state, screen-share action is present, permission errors are actionable, and only the initiator sees “Encerrar chamada”.

- [ ] **Step 2: Implement active-room banner**

Show the active room in the workspace header with participant count and a join action. Do not automatically request camera or microphone on page load.

- [ ] **Step 3: Implement the call overlay**

Render local and remote video elements, participant names, connection state, permission messages, and keyboard-accessible controls. Stop screen sharing cleanly when the browser ends the display stream.

- [ ] **Step 4: Wire room lifecycle**

Start local media only after “Iniciar chamada” or “Entrar na chamada”, subscribe to the room, add/remove peer streams, leave on close, and end only when the initiator confirms.

- [ ] **Step 5: Run component tests**

Run: `npm test -- --run src/components/CallRoom.test.tsx`

Expected: PASS without real media devices.

- [ ] **Step 6: Commit**

```bash
git add src/components/CallRoom.tsx src/components/CallRoom.test.tsx src/App.tsx src/styles/global.css
git commit -m "feat: add video call and screen sharing UI"
```

## Task 5: Capture consent and generate concise meeting minutes

**Files:**
- Create: `supabase/migrations/20260818110000_meeting_minutes.sql`
- Create: `src/components/MeetingConsent.tsx`
- Create: `src/components/MeetingMinutes.tsx`
- Create: `src/collaboration/meetingMinutes.ts`
- Test: `src/components/MeetingMinutes.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Write failing consent and summary tests**

Cover blocked entry without confirmation, confirmation recorded per meeting,
speaker-attributed summary sections, omission of verbatim transcript output,
and PDF/HTML export actions.

- [ ] **Step 2: Add consent gate**

Show the recording/transcription notice before joining. Enable entry only after
the user selects “OK”; do not request or capture media before confirmation.

- [ ] **Step 3: Persist meeting metadata and minutes**

Store the meeting, participants’ confirmations, summarized content, speaker
labels, and export metadata with RLS for workspace members. Keep raw media out
of the database and do not expose server-side credentials in the browser.

- [ ] **Step 4: Build the minutes viewer and exports**

Add the “Atas de reunião” view beside Quadro, Atividade, and Calendário. Render
summary, decisions, responsible people, and next steps. Generate a print-safe
HTML document and a PDF export without requiring users to read a full transcript.

- [ ] **Step 5: Run focused and browser tests**

Verify consent, summarized speaker attribution for Braga, Pallus, and Kayo,
history loading, and both export formats with mocked transcription results.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations src/components src/collaboration src/App.tsx src/styles/global.css
git commit -m "feat: add consented summarized meeting minutes"
```

## Task 6: Configure TURN and verify production media

**Files:**
- Modify: `docs/PRIVATE-WORKSPACE-SETUP.md`
- Modify: `.env.example` only with non-secret variable names.

- [ ] **Step 1: Select and configure TURN**

Create a TURN credential with a provider that supports temporary credentials. Store the server URL, username, and credential only in Supabase secrets or a server-side broker. Do not add them to Vite public environment variables.

- [ ] **Step 2: Configure STUN/TURN delivery**

Expose only the short-lived ICE server configuration to the authenticated call session. Verify that the browser never receives a long-lived provider secret.

- [ ] **Step 3: Run browser verification**

Use three authenticated browser contexts to create, join, and leave a room. Test camera, microphone, screen sharing, participant cap, initiator ending, permission denial, and a refresh during an active room.

- [ ] **Step 4: Run full validation**

Run `npm test -- --run`, `npm run build`, `git diff --check`, Supabase security advisors, and the production Playwright smoke suite. Confirm no media stream is sent to storage or persisted in Postgres.

- [ ] **Step 5: Commit documentation**

```bash
git add docs/PRIVATE-WORKSPACE-SETUP.md .env.example
git commit -m "docs: document call room production setup"
```
