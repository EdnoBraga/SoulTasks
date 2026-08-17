create table if not exists public.call_rooms (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  initiator_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'ended')),
  created_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz
);

create table if not exists public.call_participants (
  room_id uuid not null references public.call_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  joined_at timestamptz not null default timezone('utc', now()),
  left_at timestamptz,
  active boolean not null default true,
  primary key (room_id, user_id)
);

create index if not exists call_rooms_active_workspace_idx on public.call_rooms(workspace_id, status, created_at desc);
create index if not exists call_participants_active_room_idx on public.call_participants(room_id, active);

alter table public.call_rooms enable row level security;
alter table public.call_participants enable row level security;

drop policy if exists "Members can read active call rooms" on public.call_rooms;
create policy "Members can read active call rooms" on public.call_rooms for select to authenticated using (private.is_workspace_member(workspace_id));
drop policy if exists "Members can start call rooms" on public.call_rooms;
create policy "Members can start call rooms" on public.call_rooms for insert to authenticated with check (initiator_id = (select auth.uid()) and private.is_workspace_member(workspace_id));
drop policy if exists "Initiators can end call rooms" on public.call_rooms;
create policy "Initiators can end call rooms" on public.call_rooms for update to authenticated using (initiator_id = (select auth.uid()) and private.is_workspace_member(workspace_id)) with check (initiator_id = (select auth.uid()) and private.is_workspace_member(workspace_id));

drop policy if exists "Members can read call participants" on public.call_participants;
create policy "Members can read call participants" on public.call_participants for select to authenticated using (exists (select 1 from public.call_rooms r where r.id = room_id and private.is_workspace_member(r.workspace_id)));
drop policy if exists "Members can join calls" on public.call_participants;
create policy "Members can join calls" on public.call_participants for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.call_rooms r where r.id = room_id and r.status = 'active' and private.is_workspace_member(r.workspace_id)));
drop policy if exists "Members can leave calls" on public.call_participants;
create policy "Members can leave calls" on public.call_participants for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, insert, update on public.call_rooms to authenticated;
grant select, insert, update on public.call_participants to authenticated;
