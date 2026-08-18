create table if not exists public.meeting_minutes (
  id uuid primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  participants jsonb not null default '[]'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  decisions jsonb not null default '[]'::jsonb,
  next_steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists meeting_minutes_workspace_started_idx
  on public.meeting_minutes(workspace_id, started_at desc);

alter table public.meeting_minutes enable row level security;

drop policy if exists "Members can read meeting minutes" on public.meeting_minutes;
create policy "Members can read meeting minutes" on public.meeting_minutes
  for select to authenticated
  using (private.is_workspace_member(workspace_id));

drop policy if exists "Members can create meeting minutes" on public.meeting_minutes;
create policy "Members can create meeting minutes" on public.meeting_minutes
  for insert to authenticated
  with check (author_id = (select auth.uid()) and private.is_workspace_member(workspace_id));

drop policy if exists "Admins can delete meeting minutes" on public.meeting_minutes;
create policy "Admins can delete meeting minutes" on public.meeting_minutes
  for delete to authenticated
  using (private.is_workspace_admin(workspace_id));

grant select, insert, delete on public.meeting_minutes to authenticated;
