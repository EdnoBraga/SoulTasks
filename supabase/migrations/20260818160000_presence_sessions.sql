create table if not exists public.presence_sessions (
  id uuid primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz
);

create index if not exists presence_sessions_workspace_user_idx on public.presence_sessions(workspace_id, user_id, started_at desc);
alter table public.presence_sessions enable row level security;
drop policy if exists "Members can write own presence sessions" on public.presence_sessions;
create policy "Members can write own presence sessions" on public.presence_sessions for insert to authenticated with check (user_id = (select auth.uid()) and private.is_workspace_member(workspace_id));
drop policy if exists "Members can update own presence sessions" on public.presence_sessions;
create policy "Members can update own presence sessions" on public.presence_sessions for update to authenticated using (user_id = (select auth.uid()) and private.is_workspace_member(workspace_id)) with check (user_id = (select auth.uid()) and private.is_workspace_member(workspace_id));
drop policy if exists "Admins can read presence sessions" on public.presence_sessions;
create policy "Admins can read presence sessions" on public.presence_sessions for select to authenticated using (private.is_workspace_admin(workspace_id));
grant insert, update on public.presence_sessions to authenticated;
grant select on public.presence_sessions to authenticated;
