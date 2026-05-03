-- Run this if the app says:
-- "Could not find the function public.add_chat_member(...) in the schema cache"
--
-- This creates only the add-member RPC and forces Supabase/PostgREST to reload it.

drop function if exists public.add_chat_member(text, uuid, text);

create or replace function public.add_chat_member(
  p_session_token text,
  p_thread_id uuid,
  p_username text
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_player_id uuid;
  v_member_id uuid;
  v_clean_username text := trim(p_username);
begin
  v_player_id := private.require_player_id(p_session_token);

  if length(v_clean_username) < 1 then
    raise exception 'Choose a player to add';
  end if;

  if not exists (
    select 1
    from public.chat_thread_members ctm
    where ctm.thread_id = p_thread_id
      and ctm.player_id = v_player_id
  ) then
    raise exception 'Chat not found';
  end if;

  select p.id into v_member_id
  from public.players p
  where p.username = v_clean_username::citext;

  if v_member_id is null then
    raise exception 'Player not found';
  end if;

  insert into public.chat_thread_members (thread_id, player_id)
  values (p_thread_id, v_member_id)
  on conflict do nothing;

  update public.chat_threads
  set updated_at = now()
  where public.chat_threads.id = p_thread_id;

  return p_thread_id;
end;
$$;

grant execute on function public.add_chat_member(text, uuid, text) to anon, authenticated;

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');

select
  routine_schema,
  routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'add_chat_member';
