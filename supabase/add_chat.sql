-- Adds public leaderboard chat plus private/group dashboard chats.
-- Run this once in Supabase SQL Editor.

create table if not exists public.public_chat_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  message text not null check (char_length(trim(message)) between 1 and 300),
  created_at timestamptz not null default now()
);

create index if not exists public_chat_messages_created_at_idx
  on public.public_chat_messages(created_at desc);

create table if not exists public.chat_threads (
  id uuid primary key default extensions.gen_random_uuid(),
  title text,
  created_by uuid not null references public.players(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_thread_members (
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (thread_id, player_id)
);

create index if not exists chat_thread_members_player_id_idx
  on public.chat_thread_members(player_id);

create table if not exists public.chat_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  sender_id uuid not null references public.players(id) on delete cascade,
  message text not null check (char_length(trim(message)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_thread_created_at_idx
  on public.chat_messages(thread_id, created_at desc);

drop function if exists public.post_public_chat(text, text);
drop function if exists public.list_public_chat(integer);
drop function if exists public.list_chat_players(text);
drop function if exists public.list_chat_threads(text);
drop function if exists public.create_chat_thread(text, text[], text);
drop function if exists public.add_chat_member(text, uuid, text);
drop function if exists public.post_chat_message(text, uuid, text);
drop function if exists public.list_chat_messages(text, uuid, integer);

create or replace function public.list_public_chat(p_limit integer default 30)
returns table (
  message_id uuid,
  username citext,
  display_name text,
  avatar text,
  message text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    recent.id as message_id,
    p.username,
    coalesce(nullif(p.display_name, ''), p.username::text) as display_name,
    p.avatar,
    recent.message,
    recent.created_at
  from (
    select pcm.*
    from public.public_chat_messages pcm
    order by pcm.created_at desc
    limit greatest(least(p_limit, 50), 1)
  ) recent
  join public.players p on p.id = recent.player_id
  order by recent.created_at asc
$$;

create or replace function public.post_public_chat(p_session_token text, p_message text)
returns table (
  message_id uuid,
  username citext,
  display_name text,
  avatar text,
  message text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_player_id uuid;
  v_message text := trim(p_message);
begin
  if length(v_message) < 1 then
    raise exception 'Type a message first';
  end if;

  if length(v_message) > 300 then
    raise exception 'Public chat messages must be 300 characters or less';
  end if;

  v_player_id := private.require_player_id(p_session_token);

  insert into public.public_chat_messages (player_id, message)
  values (v_player_id, v_message);

  return query
  select * from public.list_public_chat(30);
end;
$$;

create or replace function public.list_chat_players(p_session_token text)
returns table (
  username citext,
  display_name text,
  avatar text
)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_player_id uuid;
begin
  v_player_id := private.require_player_id(p_session_token);

  return query
  select
    p.username,
    coalesce(nullif(p.display_name, ''), p.username::text) as display_name,
    p.avatar
  from public.players p
  where p.id <> v_player_id
  order by coalesce(nullif(p.display_name, ''), p.username::text), p.username
  limit 100;
end;
$$;

create or replace function public.list_chat_threads(p_session_token text)
returns table (
  chat_thread_id uuid,
  title text,
  member_usernames text[],
  member_names text[],
  member_avatars text[],
  last_message text,
  last_message_at timestamptz
)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_player_id uuid;
begin
  v_player_id := private.require_player_id(p_session_token);

  return query
  select
    t.id as chat_thread_id,
    t.title,
    array_agg(p.username::text order by coalesce(nullif(p.display_name, ''), p.username::text), p.username::text) as member_usernames,
    array_agg(coalesce(nullif(p.display_name, ''), p.username::text) order by coalesce(nullif(p.display_name, ''), p.username::text), p.username::text) as member_names,
    array_agg(p.avatar order by coalesce(nullif(p.display_name, ''), p.username::text), p.username::text) as member_avatars,
    latest.message as last_message,
    latest.created_at as last_message_at
  from public.chat_threads t
  join public.chat_thread_members mine
    on mine.thread_id = t.id
   and mine.player_id = v_player_id
  join public.chat_thread_members tm on tm.thread_id = t.id
  join public.players p on p.id = tm.player_id
  left join lateral (
    select cm.message, cm.created_at
    from public.chat_messages cm
    where cm.thread_id = t.id
    order by cm.created_at desc
    limit 1
  ) latest on true
  group by t.id, t.title, t.updated_at, t.created_at, latest.message, latest.created_at
  order by coalesce(latest.created_at, t.updated_at, t.created_at) desc
  limit 50;
end;
$$;

create or replace function public.create_chat_thread(
  p_session_token text,
  p_member_usernames text[],
  p_title text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_player_id uuid;
  v_thread_id uuid;
  v_member_count integer;
  v_title text := nullif(trim(coalesce(p_title, '')), '');
begin
  v_player_id := private.require_player_id(p_session_token);

  if v_title is not null and length(v_title) > 80 then
    raise exception 'Chat name must be 80 characters or less';
  end if;

  insert into public.chat_threads (title, created_by)
  values (v_title, v_player_id)
  returning id into v_thread_id;

  insert into public.chat_thread_members (thread_id, player_id)
  values (v_thread_id, v_player_id)
  on conflict do nothing;

  insert into public.chat_thread_members (thread_id, player_id)
  select distinct v_thread_id, p.id
  from public.players p
  join unnest(coalesce(p_member_usernames, '{}'::text[])) as requested(username)
    on p.username = trim(requested.username)::citext
  where trim(requested.username) <> ''
  on conflict do nothing;

  select count(*) into v_member_count
  from public.chat_thread_members
  where thread_id = v_thread_id;

  if v_member_count < 2 then
    delete from public.chat_threads
    where public.chat_threads.id = v_thread_id;
    raise exception 'Pick at least one other player';
  end if;

  return v_thread_id;
end;
$$;

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

create or replace function public.list_chat_messages(
  p_session_token text,
  p_thread_id uuid,
  p_limit integer default 50
)
returns table (
  message_id uuid,
  chat_thread_id uuid,
  username citext,
  display_name text,
  avatar text,
  message text,
  created_at timestamptz,
  is_mine boolean
)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_player_id uuid;
begin
  v_player_id := private.require_player_id(p_session_token);

  if not exists (
    select 1
    from public.chat_thread_members ctm
    where ctm.thread_id = p_thread_id
      and ctm.player_id = v_player_id
  ) then
    raise exception 'Chat not found';
  end if;

  return query
  select
    recent.id as message_id,
    recent.thread_id as chat_thread_id,
    p.username,
    coalesce(nullif(p.display_name, ''), p.username::text) as display_name,
    p.avatar,
    recent.message,
    recent.created_at,
    recent.sender_id = v_player_id as is_mine
  from (
    select cm.*
    from public.chat_messages cm
    where cm.thread_id = p_thread_id
    order by cm.created_at desc
    limit greatest(least(p_limit, 100), 1)
  ) recent
  join public.players p on p.id = recent.sender_id
  order by recent.created_at asc;
end;
$$;

create or replace function public.post_chat_message(
  p_session_token text,
  p_thread_id uuid,
  p_message text
)
returns table (
  message_id uuid,
  chat_thread_id uuid,
  username citext,
  display_name text,
  avatar text,
  message text,
  created_at timestamptz,
  is_mine boolean
)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_player_id uuid;
  v_message text := trim(p_message);
begin
  if length(v_message) < 1 then
    raise exception 'Type a message first';
  end if;

  if length(v_message) > 500 then
    raise exception 'Chat messages must be 500 characters or less';
  end if;

  v_player_id := private.require_player_id(p_session_token);

  if not exists (
    select 1
    from public.chat_thread_members ctm
    where ctm.thread_id = p_thread_id
      and ctm.player_id = v_player_id
  ) then
    raise exception 'Chat not found';
  end if;

  insert into public.chat_messages (thread_id, sender_id, message)
  values (p_thread_id, v_player_id, v_message);

  update public.chat_threads
  set updated_at = now()
  where public.chat_threads.id = p_thread_id;

  return query
  select * from public.list_chat_messages(p_session_token, p_thread_id, 50);
end;
$$;

alter table public.public_chat_messages enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_thread_members enable row level security;
alter table public.chat_messages enable row level security;

revoke all on table public.public_chat_messages from anon, authenticated;
revoke all on table public.chat_threads from anon, authenticated;
revoke all on table public.chat_thread_members from anon, authenticated;
revoke all on table public.chat_messages from anon, authenticated;

grant execute on function public.list_public_chat(integer) to anon, authenticated;
grant execute on function public.post_public_chat(text, text) to anon, authenticated;
grant execute on function public.list_chat_players(text) to anon, authenticated;
grant execute on function public.list_chat_threads(text) to anon, authenticated;
grant execute on function public.create_chat_thread(text, text[], text) to anon, authenticated;
grant execute on function public.add_chat_member(text, uuid, text) to anon, authenticated;
grant execute on function public.list_chat_messages(text, uuid, integer) to anon, authenticated;
grant execute on function public.post_chat_message(text, uuid, text) to anon, authenticated;

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
