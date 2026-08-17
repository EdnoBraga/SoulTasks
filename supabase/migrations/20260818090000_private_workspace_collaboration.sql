create schema if not exists private;

create table if not exists public.workspaces (
  id uuid primary key,
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.workspaces (id, slug, name)
values ('00000000-0000-0000-0000-000000000001', 'soulfork', 'SoulFork')
on conflict (slug) do nothing;

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  display_name text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, user_id)
);

create index if not exists workspace_members_workspace_idx on public.workspace_members(workspace_id, status);

create table if not exists public.chat_channels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  kind text not null check (kind in ('general', 'direct')),
  name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists chat_channels_workspace_idx on public.chat_channels(workspace_id, created_at);

create table if not exists public.chat_channel_members (
  channel_id uuid not null references public.chat_channels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (channel_id, user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.chat_channels(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (length(trim(content)) > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz
);

create index if not exists chat_messages_channel_created_idx on public.chat_messages(channel_id, created_at);

insert into public.chat_channels (id, workspace_id, kind, name)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'general', 'Geral')
on conflict (id) do nothing;

create or replace function private.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = (select auth.uid())
      and status = 'active'
  );
$$;

create or replace function private.is_workspace_admin(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = (select auth.uid())
      and role = 'admin'
      and status = 'active'
  );
$$;

create or replace function private.can_access_channel(target_channel_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.chat_channels c
    where c.id = target_channel_id
      and private.is_workspace_member(c.workspace_id)
      and (c.kind = 'general' or exists (
        select 1 from public.chat_channel_members cm
        where cm.channel_id = c.id and cm.user_id = (select auth.uid())
      ))
  );
$$;

grant usage on schema private to authenticated;
grant execute on function private.is_workspace_member(uuid) to authenticated;
grant execute on function private.is_workspace_admin(uuid) to authenticated;
grant execute on function private.can_access_channel(uuid) to authenticated;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.chat_channels enable row level security;
alter table public.chat_channel_members enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "Members can read their workspace" on public.workspaces;
create policy "Members can read their workspace" on public.workspaces for select to authenticated
  using (private.is_workspace_member(id));

drop policy if exists "Members can read workspace members" on public.workspace_members;
create policy "Members can read workspace members" on public.workspace_members for select to authenticated
  using (private.is_workspace_member(workspace_id));

drop policy if exists "Members can read workspace channels" on public.chat_channels;
create policy "Members can read workspace channels" on public.chat_channels for select to authenticated
  using (private.can_access_channel(id));

drop policy if exists "Members can read channel members" on public.chat_channel_members;
create policy "Members can read channel members" on public.chat_channel_members for select to authenticated
  using (exists (select 1 from public.chat_channels c where c.id = channel_id and private.is_workspace_member(c.workspace_id)));

drop policy if exists "Members can read channel messages" on public.chat_messages;
create policy "Members can read channel messages" on public.chat_messages for select to authenticated
  using (private.can_access_channel(channel_id));

drop policy if exists "Members can send channel messages" on public.chat_messages;
create policy "Members can send channel messages" on public.chat_messages for insert to authenticated
  with check (author_id = (select auth.uid()) and private.can_access_channel(channel_id));

drop policy if exists "Authors can update messages" on public.chat_messages;
create policy "Authors can update messages" on public.chat_messages for update to authenticated
  using (author_id = (select auth.uid()) and private.can_access_channel(channel_id))
  with check (author_id = (select auth.uid()) and private.can_access_channel(channel_id));

grant select on public.workspaces to authenticated;
grant select on public.workspace_members to authenticated;
grant select on public.chat_channels to authenticated;
grant select on public.chat_channel_members to authenticated;
grant select, insert, update on public.chat_messages to authenticated;

create table if not exists public.workspace_board_snapshots (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.workspace_board_snapshots enable row level security;

drop policy if exists "Members can read workspace snapshot" on public.workspace_board_snapshots;
create policy "Members can read workspace snapshot" on public.workspace_board_snapshots for select to authenticated
  using (private.is_workspace_member(workspace_id));

drop policy if exists "Members can create workspace snapshot" on public.workspace_board_snapshots;
create policy "Members can create workspace snapshot" on public.workspace_board_snapshots for insert to authenticated
  with check (private.is_workspace_member(workspace_id));

drop policy if exists "Members can update workspace snapshot" on public.workspace_board_snapshots;
create policy "Members can update workspace snapshot" on public.workspace_board_snapshots for update to authenticated
  using (private.is_workspace_member(workspace_id))
  with check (private.is_workspace_member(workspace_id));

grant select, insert, update on public.workspace_board_snapshots to authenticated;
