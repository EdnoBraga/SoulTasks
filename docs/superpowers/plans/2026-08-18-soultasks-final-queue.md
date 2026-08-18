# SoulTasks Final Queue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the remaining SoulTasks improvements from items 18 through 27, with each item tested, committed, merged to `main`, and deployed before the next item.

**Architecture:** Keep domain behavior in small tested TypeScript modules, UI behavior in existing React components, and privileged integrations in authenticated Supabase Edge Functions. Exports remain client-side; Google integrations and invitation diagnostics use server-side OAuth or Supabase APIs without exposing secrets.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Supabase Auth/REST/Edge Functions, GitHub Actions, Hostinger FTP deployment.

**Spec:** User feature list items 18–27 in the conversation.

## Global Constraints

- Preserve existing behavior and public site configuration.
- Use TDD: write a failing test, run it, implement the smallest change, then run the full suite and build.
- Do not place Supabase secret keys, OAuth client secrets, or provider tokens in browser code.
- Publish each completed item through a branch, PR merge, and deployment verification.

### Task 18: Export tasks to CSV/PDF

**Files:** `src/domain/export.ts`, `src/domain/export.test.ts`, `src/components/ExportMenu.tsx`, `src/App.tsx`, `src/styles/global.css`.

- [ ] Test CSV escaping, selected workflow export, and printable PDF view.
- [ ] Implement CSV generation with UTF-8 BOM and a print-friendly document view using `window.print()`.
- [ ] Add export controls to the board toolbar and verify downloaded CSV content.

### Task 19: Granular administrative permissions

**Files:** `supabase/migrations/<timestamp>_granular_permissions.sql`, `src/domain/permissions.ts`, `src/domain/permissions.test.ts`, `src/collaboration/collaborationApi.ts`, `src/App.tsx`.

- [ ] Test permission evaluation for workspace admin, editor, commenter, and viewer.
- [ ] Add member permission data and server-side authorization checks for invitations, deletion, and editing.
- [ ] Add a member permission selector visible only to administrators and migrate the policy safely.

### Task 20: Google Calendar synchronization

**Files:** `src/integrations/googleCalendar.ts`, tests, `supabase/functions/google-calendar-sync/index.ts`, migration for connection metadata, calendar UI.

- [ ] Test event mapping, date conversion, and idempotent update behavior.
- [ ] Implement authenticated sync contract and calendar action UI without exposing OAuth secrets.
- [ ] Deploy the function and document the required Google OAuth secrets.

### Task 21: Google Drive synchronization

**Files:** `src/integrations/googleDrive.ts`, tests, `supabase/functions/google-drive-sync/index.ts`, attachment UI.

- [ ] Test upload metadata mapping and card-to-file association.
- [ ] Implement server-side Drive calls and a card action for storing shared files.
- [ ] Deploy and verify the protected function contract.

### Task 22: Activity separated by sector

**Files:** `src/domain/activity.ts`, tests, `src/components/ActivityTimeline.tsx`, `src/App.tsx`, styles.

- [ ] Test grouping activity events by workflow/department.
- [ ] Add sector filter tabs while preserving the global activity view.
- [ ] Verify cards and Inbox events appear in the correct sector.

### Task 23: Full calendar task creation and Google Calendar link

**Files:** `src/components/CalendarWorkspace.tsx`, tests, `src/domain/calendar.ts`, `src/App.tsx`.

- [ ] Test creating a card from a date cell and moving it between dates.
- [ ] Add month navigation, date-cell creation, and a synchronization status/action.
- [ ] Verify persistence of date changes in the shared board snapshot.

### Task 24: Admin-only online time counters

**Files:** `src/domain/presenceDuration.ts`, tests, `src/collaboration/realtime.ts`, `src/components/TeamOverview.tsx`, migration/presence storage if required.

- [ ] Test duration accumulation across online/offline transitions.
- [ ] Track sessions only for authenticated workspace members and expose totals only when the current member is admin.
- [ ] Verify a non-admin cannot receive duration data from the API.

### Task 25: Increase logo size by 70%

**Files:** `src/styles/global.css`, `src/components/BoardNavigation.tsx`, relevant visual test.

- [ ] Test the logo has the intended accessible label and navigation placement.
- [ ] Increase rendered logo dimensions by 70% while preserving header layout and responsive overflow.
- [ ] Verify production build and mobile layout.

### Task 26: Diagnose and repair invitations

**Files:** `supabase/functions/invite-workspace-member/index.ts`, `src/collaboration/collaborationApi.ts`, tests, invitation diagnostics UI/docs.

- [ ] Test invalid email, duplicate member, missing redirect URL, and provider failure responses.
- [ ] Return actionable error codes and ensure invited users are linked to the workspace only after Auth invitation succeeds.
- [ ] Deploy and verify the function with a safe non-delivery validation path.

### Task 27: Restrict zoom to the board workspace

**Files:** `src/components/BoardZoomControl.tsx`, tests, `src/styles/global.css`, `src/App.tsx`.

- [ ] Test zoom changes only the board canvas transform and not the document root.
- [ ] Move the slider into the board canvas footer and keep horizontal scrolling usable.
- [ ] Verify keyboard accessibility and responsive behavior.

## Completion Gate

After each task, run `npm test -- --run`, `npm run build`, and `git diff --check`; create a branch, commit only that task, push, merge the PR, pull `main`, and verify the GitHub Actions deployment run before advancing.
