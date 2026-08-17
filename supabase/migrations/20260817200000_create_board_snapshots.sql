create table if not exists public.board_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.board_snapshots enable row level security;

drop policy if exists "Users can read their own SoulTasks snapshot" on public.board_snapshots;
create policy "Users can read their own SoulTasks snapshot"
  on public.board_snapshots for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own SoulTasks snapshot" on public.board_snapshots;
create policy "Users can insert their own SoulTasks snapshot"
  on public.board_snapshots for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own SoulTasks snapshot" on public.board_snapshots;
create policy "Users can update their own SoulTasks snapshot"
  on public.board_snapshots for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on public.board_snapshots to authenticated;
