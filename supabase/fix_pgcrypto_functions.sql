-- Run this if create_player/login_player says:
-- "function gen_random_bytes(integer) does not exist"
--
-- Supabase usually installs pgcrypto functions in the extensions schema.
-- This patch schema-qualifies pgcrypto calls used by the custom username/password flow.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create or replace function private.hash_token(p_token text)
returns text
language sql
stable
as $$
  select encode(extensions.digest(p_token, 'sha256'), 'hex')
$$;

create or replace function public.create_player(p_username text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, private, extensions
as $$
declare
  v_player_id uuid;
  v_token text;
  v_clean_username text := trim(p_username);
begin
  if length(v_clean_username) < 2 then
    raise exception 'Username must be at least 2 characters';
  end if;

  if length(p_password) < 4 then
    raise exception 'Password must be at least 4 characters';
  end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.players (username, password_hash)
  values (v_clean_username, extensions.crypt(p_password, extensions.gen_salt('bf')))
  returning id into v_player_id;

  insert into public.player_sessions (player_id, token_hash)
  values (v_player_id, private.hash_token(v_token));

  perform private.sync_achievements(v_player_id);

  return jsonb_build_object(
    'sessionToken', v_token,
    'player', public.player_dashboard(v_player_id)
  );
end;
$$;

create or replace function public.login_player(p_username text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, private, extensions
as $$
declare
  v_player public.players%rowtype;
  v_token text;
begin
  select *
  into v_player
  from public.players
  where username = trim(p_username)::citext;

  if v_player.id is null or v_player.password_hash <> extensions.crypt(p_password, v_player.password_hash) then
    raise exception 'Invalid username or password';
  end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.player_sessions (player_id, token_hash)
  values (v_player.id, private.hash_token(v_token));

  update public.players
  set last_login_at = now()
  where id = v_player.id;

  return jsonb_build_object(
    'sessionToken', v_token,
    'player', public.player_dashboard(v_player.id)
  );
end;
$$;

grant execute on function public.create_player(text, text) to anon, authenticated;
grant execute on function public.login_player(text, text) to anon, authenticated;
