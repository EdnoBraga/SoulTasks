# SoulBoard MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished local-first kanban web app with SoulFork branding, customizable columns, fast card capture, a smart card modal, drag-and-drop, search/filtering, and browser persistence.

**Architecture:** React + TypeScript application with a small domain model, reducer-based application state, and a persistence adapter isolated behind a storage interface. UI components remain independent from persistence so localStorage/IndexedDB can be replaced by an authenticated API later.

**Tech Stack:** Vite, React, TypeScript, CSS modules or scoped CSS, Vitest, React Testing Library, native HTML drag-and-drop, lucide-react icons.

## Global Constraints

- Use the SoulFork palette: `#04060E`, `#080D1E`, `#111A33`, `#2F5FE0`, `#5B8CFF`, `#63D9FF`, `#9FE2FF`, `#7A35FF`, `#A78BFA`, `#8FD41F`, `#EAF0FF`, `#A9B6DC`.
- Keep the MVP local-first and single-user.
- Isolate persistence behind an adapter so a future API can replace browser storage.
- Preserve keyboard focus, modal focus trapping, reduced motion, responsive layout, and visible focus states.
- Keep copy in Brazilian Portuguese and use active, concrete labels.
- Use demo data so the first render feels complete.
- Verify build, tests, `git diff --check`, persistence after reload, drag-and-drop, modal keyboard behavior, and responsive layout.

---

### Task 1: Bootstrap the React application

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `vite.config.ts`
- Create: `tsconfig.json`

**Interfaces:**
- Produces a runnable Vite app at the repository root with `npm run dev`, `npm run build`, and `npm run test` scripts.

- [ ] **Step 1: Create the package manifest and Vite/TypeScript configuration.**

Include React, React DOM, lucide-react, Vitest, jsdom, @testing-library/react, @testing-library/jest-dom, and @testing-library/user-event.

- [ ] **Step 2: Add the application entry point and a temporary shell.**

Render `<App />` from `src/main.tsx`; render a simple visible app title from `src/App.tsx` so the build can be checked before domain work begins.

- [ ] **Step 3: Add SoulFork design tokens and global reset.**

Define the palette tokens from the global constraints, typography stack, spacing scale, radii, shadows, focus ring, and reduced-motion media query.

- [ ] **Step 4: Run the bootstrap checks.**

Run `npm install`, `npm run build`, and `npm run test -- --run`.
Expected: build succeeds and the test runner starts with no test files or an explicit zero-test result.

- [ ] **Step 5: Commit the runnable foundation.**

```bash
git add package.json index.html src vite.config.ts tsconfig.json
git commit -m "chore: bootstrap SoulBoard app"
```

### Task 2: Define domain types, demo data, and state reducer

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/demoData.ts`
- Create: `src/domain/boardReducer.ts`
- Create: `src/domain/boardReducer.test.ts`

**Interfaces:**
- `BoardState` contains `boards`, `activeBoardId`, `inbox`, `labels`, and `activities`.
- `BoardAction` supports `createCard`, `updateCard`, `deleteCard`, `moveCard`, `createColumn`, `updateColumn`, `deleteColumn`, `moveColumn`, `createBoard`, `updateBoard`, `deleteBoard`, `captureInbox`, `promoteInboxItem`, and `setActiveBoard`.
- `boardReducer(state: BoardState, action: BoardAction): BoardState` is pure and never mutates input.

- [ ] **Step 1: Write reducer tests for card creation and movement.**

Cover creating a card in a target column, moving it from one column to another, and preserving the card order of unaffected columns.

- [ ] **Step 2: Write reducer tests for customizable columns.**

Cover creating a column, updating its name/color/icon/limit, reordering columns, and archiving a column without deleting its historical data.

- [ ] **Step 3: Write reducer tests for Inbox promotion and card deletion.**

Cover capturing an Inbox item, promoting it into a selected board column, and deleting a card with its related activity removed.

- [ ] **Step 4: Run the reducer tests and verify they fail before implementation.**

Run `npm run test -- src/domain/boardReducer.test.ts --run`.
Expected: FAIL because the domain module does not yet implement the reducer.

- [ ] **Step 5: Implement types, demo data, and the reducer.**

Use stable string IDs, ISO timestamps, immutable array updates, and a demo board with four columns (`A fazer`, `Em andamento`, `Revisão`, `Concluído`) plus Inbox items.

- [ ] **Step 6: Run the reducer tests.**

Run `npm run test -- src/domain/boardReducer.test.ts --run`.
Expected: PASS.

- [ ] **Step 7: Commit the domain layer.**

```bash
git add src/domain
git commit -m "feat: add SoulBoard domain model"
```

### Task 3: Add local persistence and application state hook

**Files:**
- Create: `src/storage/storageAdapter.ts`
- Create: `src/storage/localStorageAdapter.ts`
- Create: `src/storage/localStorageAdapter.test.ts`
- Create: `src/state/useBoardApp.ts`

**Interfaces:**
- `StorageAdapter.load(): BoardState | null`
- `StorageAdapter.save(state: BoardState): void`
- `StorageAdapter.clear(): void`
- `useBoardApp(): { state: BoardState; dispatch: React.Dispatch<BoardAction> }`

- [ ] **Step 1: Write persistence tests.**

Verify that saving then loading returns equivalent JSON-safe state, malformed stored JSON falls back to `null`, and `clear()` removes only the app’s namespaced key `soulboard-state-v1`.

- [ ] **Step 2: Implement the adapter with versioned storage.**

Use `localStorage`, the `soulboard-state-v1` key, safe JSON parsing, and a fallback to `createDemoState()` in the hook when no valid state exists.

- [ ] **Step 3: Implement `useBoardApp`.**

Initialize state once, dispatch reducer actions, and persist after state changes with a small debounce so typing in the modal does not write on every keystroke.

- [ ] **Step 4: Run storage tests and the production build.**

Run `npm run test -- src/storage/localStorageAdapter.test.ts --run` and `npm run build`.
Expected: PASS and a successful build.

- [ ] **Step 5: Commit persistence.**

```bash
git add src/storage src/state
git commit -m "feat: persist board state locally"
```

### Task 4: Build the app shell, navigation, and responsive board layout

**Files:**
- Create: `src/components/AppShell/AppShell.tsx`
- Create: `src/components/AppShell/AppShell.module.css`
- Create: `src/components/Topbar/Topbar.tsx`
- Create: `src/components/Topbar/Topbar.module.css`
- Create: `src/components/Board/BoardView.tsx`
- Create: `src/components/Board/BoardView.module.css`
- Create: `src/components/Inbox/InboxPanel.tsx`
- Create: `src/components/Inbox/InboxPanel.module.css`
- Modify: `src/App.tsx`

**Interfaces:**
- `AppShell` receives `children`, `onCreateCard`, `searchQuery`, and `onSearchQueryChange`.
- `BoardView` receives `board`, `dispatch`, `searchQuery`, and `activeFilters`.
- `InboxPanel` receives `items`, `onCapture`, and `onPromote`.

- [ ] **Step 1: Write a rendering test for the app shell.**

Verify the demo board title, Inbox, global “Novo card” action, and four demo column names render.

- [ ] **Step 2: Implement the shell and topbar.**

Add SoulBoard wordmark, board switcher placeholder, search field, filter button, global create-card button, and profile avatar control. Keep the toolbar usable on mobile.

- [ ] **Step 3: Implement the board canvas and Inbox panel.**

Use horizontal scrolling for columns, a dark SoulFork canvas, the violet Inbox accent, and responsive collapse to a top capture strip on small screens.

- [ ] **Step 4: Run the rendering test and build.**

Run `npm run test -- src/components/AppShell/AppShell.test.tsx --run` and `npm run build`.
Expected: PASS and successful build.

- [ ] **Step 5: Commit the shell.**

```bash
git add src/App.tsx src/components/AppShell src/components/Topbar src/components/Board src/components/Inbox
git commit -m "feat: add SoulBoard shell and board layout"
```

### Task 5: Implement customizable columns and draggable cards

**Files:**
- Create: `src/components/Column/Column.tsx`
- Create: `src/components/Column/Column.module.css`
- Create: `src/components/Card/Card.tsx`
- Create: `src/components/Card/Card.module.css`
- Create: `src/components/Board/dragAndDrop.ts`
- Create: `src/components/Board/dragAndDrop.test.ts`
- Modify: `src/components/Board/BoardView.tsx`

**Interfaces:**
- `Column` receives `column`, `cards`, `onAddCard`, `onEditColumn`, `onDeleteColumn`, and drag callbacks.
- `Card` receives `card`, `labels`, `onOpen`, `onDragStart`, and `onDragEnd`.
- `moveCardBetweenColumns(cardId, sourceColumnId, targetColumnId, targetIndex, state): BoardState` remains pure.

- [ ] **Step 1: Write drag-and-drop helper tests.**

Cover moving a card to another column, inserting at a target index, and no-op behavior when source and target are identical.

- [ ] **Step 2: Implement column and card components.**

Render column header actions, card count/limit, custom accent color, card metadata, checklist progress, due date, priority, labels, and the “Adicionar card” action.

- [ ] **Step 3: Implement native drag-and-drop wiring.**

Use `dataTransfer` with the card ID and source column ID, provide a visible drop target, dispatch `moveCard`, and ensure drag controls do not interfere with keyboard access.

- [ ] **Step 4: Add column customization menu.**

Provide inline editing for name and description plus controls for color, icon, limit, completion flag, archive, and delete with confirmation.

- [ ] **Step 5: Run drag tests and build.**

Run `npm run test -- src/components/Board/dragAndDrop.test.ts --run` and `npm run build`.
Expected: PASS and successful build.

- [ ] **Step 6: Commit board interactions.**

```bash
git add src/components/Board src/components/Column src/components/Card
git commit -m "feat: add customizable columns and card movement"
```

### Task 6: Build the smart card modal and quick capture flow

**Files:**
- Create: `src/components/CardModal/CardModal.tsx`
- Create: `src/components/CardModal/CardModal.module.css`
- Create: `src/components/CardModal/CardModal.test.tsx`
- Create: `src/components/QuickCapture/QuickCapture.tsx`
- Create: `src/components/QuickCapture/QuickCapture.module.css`
- Modify: `src/App.tsx`

**Interfaces:**
- `CardModal` receives `mode`, `initialCard`, `columns`, `labels`, `onSave`, and `onClose`.
- `QuickCapture` receives `onCapture`, `onOpenFullEditor`, and `placeholder`.
- `onSave(cardDraft: CardDraft): void` is the single modal submit contract.

- [ ] **Step 1: Write modal interaction tests.**

Cover autofocus on title, selecting a column, saving with `Ctrl + Enter`, closing with `Escape`, required title validation, and discard confirmation when dirty.

- [ ] **Step 2: Implement the modal shell and focus management.**

Use a dialog role, focus trap, restore focus to the opener, backdrop close only when clean, and a clear heading that changes between “Novo card” and “Editar card”.

- [ ] **Step 3: Implement the card fields.**

Add title, description, column, priority, due date, labels, checklist, comments, and local attachment placeholders. Keep advanced fields collapsible.

- [ ] **Step 4: Implement quick capture.**

Create from Inbox or column with title-only Enter submission, allow “abrir editor completo”, and promote Inbox items into a selected board column.

- [ ] **Step 5: Wire global shortcuts and toast feedback.**

Use `Ctrl/Cmd + K` for global card creation, `Ctrl/Cmd + Enter` to save, `Esc` to close, and show concise Portuguese toasts for created, updated, moved, and deleted actions.

- [ ] **Step 6: Run modal tests and build.**

Run `npm run test -- src/components/CardModal/CardModal.test.tsx --run` and `npm run build`.
Expected: PASS and successful build.

- [ ] **Step 7: Commit card creation UX.**

```bash
git add src/App.tsx src/components/CardModal src/components/QuickCapture
git commit -m "feat: add smart card creation modal"
```

### Task 7: Add search, filters, empty states, and polish

**Files:**
- Create: `src/domain/selectors.ts`
- Create: `src/domain/selectors.test.ts`
- Create: `src/components/Filters/FilterPopover.tsx`
- Create: `src/components/Filters/FilterPopover.module.css`
- Create: `src/components/Toast/ToastRegion.tsx`
- Create: `src/components/Toast/ToastRegion.module.css`
- Modify: `src/components/Board/BoardView.tsx`
- Modify: `src/components/Topbar/Topbar.tsx`

**Interfaces:**
- `filterCards(cards: Card[], query: string, filters: CardFilters): Card[]`
- `getVisibleCards(board: Board, state: BoardState, query: string, filters: CardFilters): Record<string, Card[]>`

- [ ] **Step 1: Write selector tests.**

Cover title/description search, filtering by priority, label, due-date status, and archived state.

- [ ] **Step 2: Implement selectors and filter UI.**

Keep filtering derived from state; do not mutate cards to hide them. Add reset filters and visible active-filter count.

- [ ] **Step 3: Add empty and limit states.**

Show actionable copy for empty columns, no search results, Inbox empty, and a column over its optional card limit.

- [ ] **Step 4: Add toast region and activity feedback.**

Use `aria-live="polite"`, dismissible toasts, and consistent action wording.

- [ ] **Step 5: Run selector tests and build.**

Run `npm run test -- src/domain/selectors.test.ts --run` and `npm run build`.
Expected: PASS and successful build.

- [ ] **Step 6: Commit discovery and polish.**

```bash
git add src/domain src/components/Filters src/components/Toast src/components/Board src/components/Topbar
git commit -m "feat: add search filters and feedback states"
```

### Task 8: End-to-end verification and handoff

**Files:**
- Create: `README.md`
- Create: `src/test/setup.ts`
- Modify: `package.json`

- [ ] **Step 1: Add test setup and a smoke test.**

Configure jsdom and jest-dom in Vitest. Add a smoke test that renders the app, creates a card, moves it, reloads the storage adapter, and confirms the card remains present.

- [ ] **Step 2: Run the full test suite.**

Run `npm run test -- --run`.
Expected: all tests PASS.

- [ ] **Step 3: Run build and formatting checks.**

Run `npm run build` and `git diff --check`.
Expected: successful production build and no whitespace errors.

- [ ] **Step 4: Perform manual browser QA.**

Run `npm run dev -- --host 0.0.0.0`, open the app, and verify desktop and mobile widths: create/edit/delete card, drag card, customize column, search/filter, Inbox promotion, modal keyboard flow, reload persistence, and reduced-motion behavior.

- [ ] **Step 5: Document usage and future migration seam.**

README must include install/run/test commands, local persistence behavior, keyboard shortcuts, and the fact that `StorageAdapter` is the future backend seam.

- [ ] **Step 6: Commit the verified MVP.**

```bash
git add README.md src/test package.json
git commit -m "docs: document SoulBoard MVP and verify release"
```

## Self-review checklist

- The design specification's board, columns, cards, Inbox, smart modal, local persistence, accessibility, responsive layout, and future multiuser seam are each covered by a task.
- No task relies on an undefined component or reducer action.
- Persistence is isolated before UI implementation so future backend work does not change components.
- The MVP does not include auth, collaboration, or external integrations.
- All user-facing copy is specified as Brazilian Portuguese.
