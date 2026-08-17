# Private Workspace Access and Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace public signup with administrator-managed invitations and add a shared SoulFork workspace with presence, general chat, and private conversations for three authorized users.

**Architecture:** Supabase Auth invitations will be issued by a protected Edge Function. Workspace membership, channels, and messages will be stored in RLS-protected Postgres tables. Supabase Realtime Presence will handle ephemeral online and typing state; Postgres Changes will deliver persisted messages.

**Tech Stack:** React 19, TypeScript, Vite, Supabase Auth, Supabase Postgres, Supabase Realtime, Supabase Edge Functions, Vitest, Playwright.

## Global Constraints

- No public signup.
- Exactly one administrator and two internal members in the first version.
- All three members share the same board snapshot and operational data.
- No client-external access.
- Never expose the Supabase service-role key in the browser, GitHub, or source files.
- Use RLS on every exposed collaboration table.
- Authorization must not use editable `user_metadata`.
- Invitation sender: `faleconosco@soulfork.com.br`.
- Preserve the existing deployment workflow and the original `soulfork.com.br` site.

## File Map

- Create `supabase/migrations/20260818090000_private_workspace_collaboration.sql`: workspace, membership, chat, and presence-related durable data with grants and RLS.
- Create `supabase/functions/invite-workspace-member/index.ts`: authenticated administrator-only invitation endpoint.
- Create `src/collaboration/types.ts`: shared member, channel, message, and presence types.
- Create `src/collaboration/collaborationApi.ts`: browser-safe REST/Auth calls for collaboration data.
- Create `src/collaboration/realtime.ts`: Presence and Postgres Changes subscription lifecycle.
- Create `src/components/WorkspaceMembers.tsx`: member list, roles, presence, and invite form.
- Create `src/components/ChatPanel.tsx`: general/private channel list, messages, typing state, and composer.
- Modify `src/storage/supabaseStateAdapter.ts`: load/save the workspace-scoped board snapshot.
- Modify `src/App.tsx`: private access gate, collaboration shell, and view state.
- Modify `src/styles/global.css`: member, presence, chat, and invitation UI.
- Create `src/collaboration/collaborationApi.test.ts`: API contract tests with mocked fetch.
- Create `src/collaboration/realtime.test.ts`: subscription and presence lifecycle tests.
- Create `src/components/ChatPanel.test.tsx`: chat rendering, send, and private-channel switching tests.
- Create `docs/PRIVATE-WORKSPACE-SETUP.md`: SMTP, redirect URL, admin bootstrap, and deployment secrets.

## Task 1: Lock down the current authentication surface

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/storage/supabaseStateAdapter.ts`
- Test: `src/App.auth.test.tsx`

**Interfaces:**
- Produce `AuthMode = 'signIn' | 'invitePending'` for the login surface.
- Produce `loadSupabaseSession()` behavior that keeps the current session but never creates an anonymous session.

- [ ] **Step 1: Add failing UI tests**

```tsx
it('does not render a public account creation action', () => {
  render(<AuthPanel onAuthenticated={vi.fn()} />);
  expect(screen.queryByRole('button', { name: /criar conta/i })).not.toBeInTheDocument();
  expect(screen.getByText(/convite enviado pelo administrador/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- --run src/App.auth.test.tsx`

Expected: FAIL because the current auth panel exposes the signup toggle.

- [ ] **Step 3: Remove public signup from the auth panel**

Keep password login. Replace the signup toggle with explanatory copy: “O acesso é criado por convite do administrador.” Keep the existing Supabase error handling and session persistence.

- [ ] **Step 4: Add invite-acceptance route handling**

Read `window.location.hash` for Supabase invitation tokens, show a “Definir senha” form, call the Supabase password update endpoint with the recovered session, and redirect to the dashboard after success. Do not accept an arbitrary user ID from the URL.

- [ ] **Step 5: Run the focused test and verify it passes**

Run: `npm test -- --run src/App.auth.test.tsx`

Expected: PASS with no public signup control.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/storage/supabaseStateAdapter.ts src/App.auth.test.tsx
git commit -m "feat: remove public signup from SoulTasks"
```

## Task 2: Add the workspace membership schema and RLS

**Files:**
- Create: `supabase/migrations/20260818090000_private_workspace_collaboration.sql`
- Modify: `supabase/migrations/20260817200000_create_board_snapshots.sql` only if the final workspace ownership constraint requires it.

**Interfaces:**
- Produce tables `workspaces`, `workspace_members`, `chat_channels`, `chat_channel_members`, and `chat_messages`.
- Produce helper function `public.is_workspace_member(target_workspace_id uuid)` with `SECURITY INVOKER` semantics.
- Produce policies that allow members to read shared workspace data, participants to read private channels, and only administrators to invite/manage membership through the Edge Function path.

- [ ] **Step 1: Generate the migration file**

Run: `supabase migration new private_workspace_collaboration`

- [ ] **Step 2: Add the schema**

Use UUID primary keys, `created_at`/`updated_at` timestamps, foreign keys to `auth.users`, a unique workspace slug, channel kind (`general` or `direct`), and a unique unordered pair for direct-channel membership. Add indexes on `chat_messages.channel_id, created_at` and membership lookup columns.

- [ ] **Step 3: Add RLS and grants**

Enable RLS on every new table. Grant only the required operations to `authenticated`. Use `TO authenticated` plus membership predicates. Every update policy must include both `USING` and `WITH CHECK`. Do not grant `service_role` behavior to the browser.

- [ ] **Step 4: Add deterministic seed behavior**

Create the initial SoulFork workspace and general channel only if they do not already exist. Do not insert personal user IDs in a committed migration; bootstrap the administrator through a one-time protected setup step.

- [ ] **Step 5: Apply and verify the migration**

Run the project migration through the Supabase SQL/MCP path, then query table existence, RLS status, grants, and policies. Run the Supabase security advisors and fix any exposed-table finding before continuing.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations
git commit -m "feat: add private workspace collaboration schema"
```

## Task 3: Implement the administrator-only invitation function

**Files:**
- Create: `supabase/functions/invite-workspace-member/index.ts`
- Create: `supabase/functions/_shared/auth.ts`
- Test: `supabase/functions/invite-workspace-member/index.test.ts`
- Create or modify: `docs/PRIVATE-WORKSPACE-SETUP.md`

**Interfaces:**
- `POST /functions/v1/invite-workspace-member` accepts `{ email: string, displayName: string }`.
- It returns `{ invited: true }` without returning service-role data.
- It returns `401` for missing/invalid auth and `403` for non-admin members.

- [ ] **Step 1: Write failing function tests**

Cover missing authorization, authenticated non-admin, malformed e-mail, duplicate active member, and successful invitation. Mock the Admin Auth client and assert that the service-role key is read only inside the function.

- [ ] **Step 2: Implement request validation and authorization**

Verify the bearer token with the publishable Supabase client, load the caller’s membership, require `role = 'admin'` and `status = 'active'`, normalize the e-mail to lowercase, and reject invalid input before calling Admin Auth.

- [ ] **Step 3: Invite through Supabase Auth**

Use the server-only Admin Auth client to invite the user with redirect URL `https://tasks.soulfork.com.br`. Insert the pending member record only after the Auth invitation succeeds. Do not log the access token, service-role key, or invitation URL.

- [ ] **Step 4: Deploy and configure the function**

Set the service-role key and redirect URL as Supabase function secrets. Configure SMTP sender `faleconosco@soulfork.com.br` and the allowed redirect URL in Supabase Auth settings. Do not put SMTP credentials in GitHub Actions.

- [ ] **Step 5: Run tests and verify a real invitation**

Run the function tests, call the endpoint as the seeded administrator, confirm a message is accepted by the configured SMTP provider, and verify that a non-admin receives `403`.

- [ ] **Step 6: Commit**

```bash
git add supabase/functions docs/PRIVATE-WORKSPACE-SETUP.md
git commit -m "feat: add administrator-only member invitations"
```

## Task 4: Make the board snapshot workspace-scoped

**Files:**
- Modify: `supabase/migrations/20260818090000_private_workspace_collaboration.sql`
- Modify: `src/storage/supabaseStateAdapter.ts`
- Modify: `src/App.tsx`
- Test: `src/storage/supabaseStateAdapter.test.ts`

**Interfaces:**
- `createSupabaseStateAdapter(session, workspaceId)` loads and saves the one snapshot for the shared workspace.

- [ ] **Step 1: Add a failing adapter test**

Assert that load and save use `workspace_id=eq.<workspaceId>` and send `{ workspace_id, state, updated_at }`, never the current user ID as the ownership key.

- [ ] **Step 2: Add workspace membership hydration**

After login, load the caller’s active workspace membership before loading the board. Show a blocking but actionable error if the user has no active membership.

- [ ] **Step 3: Update board RLS**

Allow select/insert/update only when the current user is an active member of the workspace. Preserve the existing snapshot data by assigning it to the initial workspace during the migration.

- [ ] **Step 4: Run tests and validate multi-user persistence**

Run `npm test -- --run src/storage/supabaseStateAdapter.test.ts`, then use two authenticated sessions to save a card in one session and reload it in the other.

- [ ] **Step 5: Commit**

```bash
git add src/storage/supabaseStateAdapter.ts src/App.tsx src/storage/supabaseStateAdapter.test.ts supabase/migrations
git commit -m "feat: scope board persistence to shared workspace"
```

## Task 5: Add realtime presence and collaboration data access

**Files:**
- Create: `src/collaboration/types.ts`
- Create: `src/collaboration/collaborationApi.ts`
- Create: `src/collaboration/realtime.ts`
- Create: `src/collaboration/collaborationApi.test.ts`
- Create: `src/collaboration/realtime.test.ts`

**Interfaces:**
- `listWorkspaceMembers(workspaceId, session): Promise<WorkspaceMember[]>`.
- `listChannels(workspaceId, session): Promise<ChatChannel[]>`.
- `listMessages(channelId, session, before?: string): Promise<ChatMessage[]>`.
- `sendMessage(channelId, content, session): Promise<ChatMessage>`.
- `subscribeToPresence(workspaceId, user, callbacks): Promise<() => void>`.
- `subscribeToMessages(channelId, callbacks): Promise<() => void>`.

- [ ] **Step 1: Write API and subscription tests**

Assert headers include only the publishable key and bearer token, query filters include workspace/channel IDs, empty message content is rejected, cleanup unsubscribes both realtime channels, and presence updates are normalized to `online`, `away`, or `offline`.

- [ ] **Step 2: Implement REST API helpers**

Use the existing fetch-based Supabase adapter pattern. Keep response parsing and error messages in this module so components do not know REST paths.

- [ ] **Step 3: Implement Realtime lifecycle**

Join one private presence channel per workspace, track the current user on mount, listen for presence sync/join/leave, and return an idempotent cleanup function. Subscribe to Postgres Changes for one selected chat channel at a time.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- --run src/collaboration`

Expected: all API and cleanup tests pass without a live browser connection.

- [ ] **Step 5: Commit**

```bash
git add src/collaboration
git commit -m "feat: add workspace presence and chat data layer"
```

## Task 6: Build members, chat, and invite UI

**Files:**
- Create: `src/components/WorkspaceMembers.tsx`
- Create: `src/components/ChatPanel.tsx`
- Create: `src/components/ChatPanel.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- `WorkspaceMembers` receives `members`, `presence`, `isAdmin`, and `onInvite`.
- `ChatPanel` receives `channels`, `messages`, `activeChannelId`, `typingUsers`, `onSelectChannel`, `onSend`, and `onTyping`.

- [ ] **Step 1: Write component tests**

Test that the admin sees “Convidar membro”, a member does not; the general channel renders; a direct channel can be selected; empty chat copy points to “Enviar mensagem”; Enter sends and Shift+Enter inserts a newline; online presence is visible by name.

- [ ] **Step 2: Implement member surface**

Add header avatars with accessible labels, online dots, member names, and an admin-only invitation modal with e-mail validation, loading, success, and failure states.

- [ ] **Step 3: Implement chat panel**

Add tabs for “Geral” and direct conversations, message history, sender/time metadata, typing indicator, composer, loading states, and retryable errors. Do not render raw user HTML; display message content as text.

- [ ] **Step 4: Wire subscriptions and cleanup**

Mount presence once per authenticated workspace, replace the message subscription when the active channel changes, and clean up on logout/unmount. Keep chat state separate from the board reducer.

- [ ] **Step 5: Run component and full tests**

Run: `npm test -- --run` and the Playwright dashboard flow covering login gate, invitation modal visibility, presence indicator, general chat, and direct chat selection.

- [ ] **Step 6: Commit**

```bash
git add src/components src/App.tsx src/styles/global.css
git commit -m "feat: add private workspace members and chat"
```

## Task 7: Stage 1 security and production verification

**Files:**
- Modify: `docs/PRIVATE-WORKSPACE-SETUP.md`
- Modify: `.github/workflows/deploy.yml` only if new build variables are required.

- [ ] **Step 1: Verify Auth settings**

Disable public signups, configure the exact redirect URL, configure SMTP sender, and verify that invited users can set a password.

- [ ] **Step 2: Verify RLS with three roles**

Test administrator, member, and unauthenticated requests against workspace, board, channel, and message endpoints. Confirm direct messages are unreadable by the other member.

- [ ] **Step 3: Verify production flow**

Run `npm test -- --run`, `npm run build`, `git diff --check`, and the Playwright smoke suite. Merge only after the GitHub Actions build and deploy succeed.

- [ ] **Step 4: Commit documentation**

```bash
git add docs/PRIVATE-WORKSPACE-SETUP.md
git commit -m "docs: document private workspace verification"
```
