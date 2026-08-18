alter table public.workspace_members
  add column if not exists permission text not null default 'editor'
  check (permission in ('admin', 'editor', 'commenter', 'viewer'));

update public.workspace_members
set permission = case when role = 'admin' then 'admin' else 'editor' end
where permission is null or (role = 'admin' and permission <> 'admin');

drop policy if exists "Admins can update member permissions" on public.workspace_members;
create policy "Admins can update member permissions" on public.workspace_members
  for update to authenticated
  using (private.is_workspace_admin(workspace_id))
  with check (private.is_workspace_admin(workspace_id));

grant update on public.workspace_members to authenticated;
