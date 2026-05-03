-- Typing Adventure Supabase schema
-- Run this in Supabase SQL Editor first.
-- Then run supabase/seed_shop_items.sql to load the shop catalog.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext;

create schema if not exists private;

do $$
begin
  create type public.game_mode as enum (
    'words',
    'numbers',
    'math',
    'equations',
    'flipper',
    'emoji',
    'scramble',
    'opposites'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.difficulty_level as enum ('easy', 'medium', 'hard');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.shop_item_type as enum ('avatar', 'background');
exception when duplicate_object then null;
end $$;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  username citext not null unique,
  display_name text not null default '',
  avatar_name text not null default 'Guide',
  password_hash text not null,
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  avatar text not null default '🐶',
  selected_bg text not null default 'paper',
  coins integer not null default 0 check (coins >= 0),
  total_points_earned integer not null default 0 check (total_points_earned >= 0),
  games_played integer not null default 0 check (games_played >= 0),
  best_score integer not null default 0 check (best_score >= 0),
  best_accuracy integer not null default 100 check (best_accuracy between 0 and 100)
);

create table if not exists public.player_sessions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days',
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists player_sessions_player_id_idx on public.player_sessions(player_id);

create table if not exists public.shop_items (
  id text not null,
  item_type public.shop_item_type not null,
  emoji text not null,
  label text,
  class_name text,
  price integer not null check (price >= 0),
  req_count integer not null default 0 check (req_count >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (item_type, id)
);

create table if not exists public.player_owned_avatars (
  player_id uuid not null references public.players(id) on delete cascade,
  avatar_id text not null,
  item_type public.shop_item_type not null default 'avatar' check (item_type = 'avatar'),
  purchased_at timestamptz not null default now(),
  primary key (player_id, avatar_id),
  foreign key (item_type, avatar_id) references public.shop_items(item_type, id) on delete restrict
);

create table if not exists public.player_owned_backgrounds (
  player_id uuid not null references public.players(id) on delete cascade,
  background_id text not null,
  item_type public.shop_item_type not null default 'background' check (item_type = 'background'),
  purchased_at timestamptz not null default now(),
  primary key (player_id, background_id),
  foreign key (item_type, background_id) references public.shop_items(item_type, id) on delete restrict
);

create table if not exists public.player_unlocked_themes (
  player_id uuid not null references public.players(id) on delete cascade,
  theme_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (player_id, theme_id)
);

create table if not exists public.player_shop_purchases (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  item_type public.shop_item_type not null,
  item_id text not null,
  price_paid integer not null check (price_paid >= 0),
  purchased_at timestamptz not null default now(),
  foreign key (item_type, item_id) references public.shop_items(item_type, id) on delete restrict
);

create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  mode public.game_mode not null,
  difficulty public.difficulty_level not null,
  score integer not null check (score >= 0),
  accuracy integer not null check (accuracy between 0 and 100),
  correct_keystrokes integer check (correct_keystrokes is null or correct_keystrokes >= 0),
  total_keystrokes integer check (total_keystrokes is null or total_keystrokes >= 0),
  coins_earned integer not null default 0 check (coins_earned >= 0),
  played_at timestamptz not null default now()
);

create index if not exists game_results_player_id_idx on public.game_results(player_id);
create index if not exists game_results_mode_score_idx on public.game_results(mode, score desc);

create table if not exists public.player_mode_stats (
  player_id uuid not null references public.players(id) on delete cascade,
  mode public.game_mode not null,
  games_played integer not null default 0 check (games_played >= 0),
  best_score integer not null default 0 check (best_score >= 0),
  best_accuracy integer not null default 0 check (best_accuracy between 0 and 100),
  total_points integer not null default 0 check (total_points >= 0),
  updated_at timestamptz not null default now(),
  primary key (player_id, mode)
);

create table if not exists public.achievements (
  id text primary key,
  name text not null,
  description text not null,
  sort_order integer not null default 0
);

create table if not exists public.player_achievements (
  player_id uuid not null references public.players(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete restrict,
  earned_at timestamptz not null default now(),
  primary key (player_id, achievement_id)
);

create table if not exists public.redemption_codes (
  code citext primary key,
  reward_coins integer not null default 0 check (reward_coins >= 0),
  active boolean not null default true,
  max_uses_per_player integer not null default 1 check (max_uses_per_player > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.player_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  code citext not null references public.redemption_codes(code) on delete restrict,
  reward_coins integer not null default 0 check (reward_coins >= 0),
  redeemed_at timestamptz not null default now()
);

create index if not exists player_code_redemptions_player_code_idx
  on public.player_code_redemptions(player_id, code);

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

insert into public.achievements (id, name, description, sort_order) values
  ('first_profile', 'First Profile', 'Created a player profile.', 10),
  ('first_game', 'First Game', 'Played one game.', 20),
  ('ten_games', '10 Game Streak', 'Played 10 games.', 30),
  ('practice_pro', 'Practice Pro', 'Played 25 games.', 40),
  ('points_500', '500 Point Explorer', 'Earned 500 total points.', 50),
  ('points_1000', '1,000 Point Champion', 'Earned 1,000 total points.', 60),
  ('points_5000', '5,000 Point Legend', 'Earned 5,000 total points.', 70),
  ('score_100', '100 Point Round', 'Scored at least 100 in one game.', 80),
  ('score_250', 'Speed Star', 'Scored at least 250 in one game.', 90),
  ('accuracy_95', 'Sharp Shooter', 'Reached at least 95% accuracy.', 100),
  ('accuracy_100', 'Perfect Accuracy', 'Finished a game with 100% accuracy.', 110),
  ('three_modes', 'Mode Explorer', 'Played at least 3 modes.', 120),
  ('all_modes', 'All Modes Adventurer', 'Played all 8 modes.', 130),
  ('first_character', 'First Character', 'Bought a character.', 140),
  ('character_collector', 'Character Collector', 'Bought 10 characters.', 150),
  ('first_world', 'First World', 'Bought a background.', 160),
  ('world_collector', 'World Collector', 'Bought 10 backgrounds.', 170),
  ('secret_finder', 'Secret Finder', 'Unlocked a secret theme.', 180)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.redemption_codes (code, reward_coins, active, max_uses_per_player)
values ('freecoins100', 100, true, 1)
on conflict (code) do update set
  reward_coins = excluded.reward_coins,
  active = excluded.active,
  max_uses_per_player = excluded.max_uses_per_player;

create or replace function private.hash_token(p_token text)
returns text
language sql
stable
as $$
  select encode(extensions.digest(p_token, 'sha256'), 'hex')
$$;

create or replace function private.require_player_id(p_session_token text)
returns uuid
language plpgsql
security definer
set search_path = public, private, extensions
as $$
declare
  v_player_id uuid;
begin
  select s.player_id
  into v_player_id
  from public.player_sessions s
  where s.token_hash = private.hash_token(p_session_token)
    and s.revoked_at is null
    and s.expires_at > now();

  if v_player_id is null then
    raise exception 'Invalid or expired session';
  end if;

  update public.player_sessions
  set last_seen_at = now()
  where token_hash = private.hash_token(p_session_token);

  return v_player_id;
end;
$$;

create or replace function private.sync_achievements(p_player_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player public.players%rowtype;
  v_mode_count integer;
  v_avatar_count integer;
  v_bg_count integer;
  v_theme_count integer;
begin
  select * into v_player from public.players where id = p_player_id;
  select count(*) into v_mode_count from public.player_mode_stats where player_id = p_player_id;
  select count(*) into v_avatar_count from public.player_owned_avatars where player_id = p_player_id;
  select count(*) into v_bg_count from public.player_owned_backgrounds where player_id = p_player_id;
  select count(*) into v_theme_count from public.player_unlocked_themes where player_id = p_player_id;

  insert into public.player_achievements (player_id, achievement_id)
  select p_player_id, id
  from public.achievements
  where
    id = 'first_profile'
    or (id = 'first_game' and v_player.games_played >= 1)
    or (id = 'ten_games' and v_player.games_played >= 10)
    or (id = 'practice_pro' and v_player.games_played >= 25)
    or (id = 'points_500' and v_player.total_points_earned >= 500)
    or (id = 'points_1000' and v_player.total_points_earned >= 1000)
    or (id = 'points_5000' and v_player.total_points_earned >= 5000)
    or (id = 'score_100' and v_player.best_score >= 100)
    or (id = 'score_250' and v_player.best_score >= 250)
    or (id = 'accuracy_95' and v_player.best_accuracy >= 95)
    or (id = 'accuracy_100' and v_player.best_accuracy = 100 and v_player.games_played > 0)
    or (id = 'three_modes' and v_mode_count >= 3)
    or (id = 'all_modes' and v_mode_count >= 8)
    or (id = 'first_character' and v_avatar_count >= 1)
    or (id = 'character_collector' and v_avatar_count >= 10)
    or (id = 'first_world' and v_bg_count >= 1)
    or (id = 'world_collector' and v_bg_count >= 10)
    or (id = 'secret_finder' and v_theme_count >= 1)
  on conflict do nothing;
end;
$$;

create or replace function public.player_dashboard(p_player_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', p.id,
    'username', p.username,
    'displayName', coalesce(nullif(p.display_name, ''), p.username::text),
    'avatarName', p.avatar_name,
    'createdAt', p.created_at,
    'avatar', p.avatar,
    'selectedBg', p.selected_bg,
    'coins', p.coins,
    'totalPointsEarned', p.total_points_earned,
    'gamesPlayed', p.games_played,
    'bestScore', p.best_score,
    'bestAccuracy', p.best_accuracy,
    'ownedAvatars', coalesce((
      select jsonb_agg(avatar_id order by purchased_at)
      from public.player_owned_avatars
      where player_id = p.id
    ), '[]'::jsonb),
    'ownedBackgrounds', coalesce((
      select jsonb_agg(background_id order by purchased_at)
      from public.player_owned_backgrounds
      where player_id = p.id
    ), '[]'::jsonb),
    'unlockedThemes', coalesce((
      select jsonb_agg(theme_id order by unlocked_at)
      from public.player_unlocked_themes
      where player_id = p.id
    ), '[]'::jsonb),
    'achievements', coalesce((
      select jsonb_agg(a.name order by a.sort_order)
      from public.player_achievements pa
      join public.achievements a on a.id = pa.achievement_id
      where pa.player_id = p.id
    ), '[]'::jsonb),
    'modeStats', coalesce((
      select jsonb_object_agg(
        mode,
        jsonb_build_object(
          'gamesPlayed', games_played,
          'bestScore', best_score,
          'bestAccuracy', best_accuracy,
          'totalPoints', total_points
        )
      )
      from public.player_mode_stats
      where player_id = p.id
    ), '{}'::jsonb),
    'recentGames', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'mode', mode,
          'difficulty', difficulty,
          'score', score,
          'accuracy', accuracy,
          'coinsEarned', coins_earned,
          'date', played_at
        )
        order by played_at desc
      )
      from (
        select *
        from public.game_results
        where player_id = p.id
        order by played_at desc
        limit 8
      ) recent
    ), '[]'::jsonb)
  )
  from public.players p
  where p.id = p_player_id
$$;

create or replace function public.create_player(p_username text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, private
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

create or replace function public.logout_player(p_session_token text)
returns boolean
language plpgsql
security definer
set search_path = public, private
as $$
begin
  update public.player_sessions
  set revoked_at = now()
  where token_hash = private.hash_token(p_session_token)
    and revoked_at is null;

  return true;
end;
$$;

create or replace function public.get_my_dashboard(p_session_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_player_id uuid;
begin
  v_player_id := private.require_player_id(p_session_token);
  return public.player_dashboard(v_player_id);
end;
$$;

create or replace function public.get_player_dashboard(p_username text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select public.player_dashboard(p.id)
  from public.players p
  where p.username = trim(p_username)::citext
$$;

create or replace function public.update_player_style(
  p_session_token text,
  p_avatar text,
  p_selected_bg text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_player_id uuid;
begin
  v_player_id := private.require_player_id(p_session_token);

  update public.players
  set
    avatar = coalesce(nullif(p_avatar, ''), avatar),
    selected_bg = coalesce(nullif(p_selected_bg, ''), selected_bg)
  where id = v_player_id;

  return public.player_dashboard(v_player_id);
end;
$$;

create or replace function public.update_player_profile(
  p_session_token text,
  p_display_name text,
  p_avatar_name text,
  p_avatar text,
  p_selected_bg text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_player_id uuid;
begin
  v_player_id := private.require_player_id(p_session_token);

  update public.players
  set
    display_name = coalesce(nullif(trim(p_display_name), ''), username::text),
    avatar_name = coalesce(nullif(trim(p_avatar_name), ''), 'Guide'),
    avatar = coalesce(nullif(p_avatar, ''), avatar),
    selected_bg = coalesce(nullif(p_selected_bg, ''), selected_bg)
  where id = v_player_id;

  return public.player_dashboard(v_player_id);
end;
$$;

create or replace function public.unlock_theme(p_session_token text, p_theme_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_player_id uuid;
begin
  v_player_id := private.require_player_id(p_session_token);

  insert into public.player_unlocked_themes (player_id, theme_id)
  values (v_player_id, trim(p_theme_id))
  on conflict do nothing;

  perform private.sync_achievements(v_player_id);

  return public.player_dashboard(v_player_id);
end;
$$;

create or replace function public.purchase_shop_item(
  p_session_token text,
  p_item_type public.shop_item_type,
  p_item_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_player_id uuid;
  v_item public.shop_items%rowtype;
  v_coins integer;
begin
  v_player_id := private.require_player_id(p_session_token);

  select * into v_item
  from public.shop_items
  where item_type = p_item_type
    and id = p_item_id
    and active = true;

  if v_item.id is null then
    raise exception 'Shop item not found';
  end if;

  select coins into v_coins
  from public.players
  where id = v_player_id
  for update;

  if v_coins < v_item.price then
    raise exception 'Not enough coins';
  end if;

  if v_item.item_type = 'avatar' and exists (
    select 1 from public.player_owned_avatars
    where player_id = v_player_id and avatar_id = v_item.id
  ) then
    return public.player_dashboard(v_player_id);
  end if;

  if v_item.item_type = 'background' and exists (
    select 1 from public.player_owned_backgrounds
    where player_id = v_player_id and background_id = v_item.id
  ) then
    return public.player_dashboard(v_player_id);
  end if;

  update public.players
  set coins = coins - v_item.price
  where id = v_player_id;

  insert into public.player_shop_purchases (player_id, item_id, item_type, price_paid)
  values (v_player_id, v_item.id, v_item.item_type, v_item.price);

  if v_item.item_type = 'avatar' then
    insert into public.player_owned_avatars (player_id, avatar_id)
    values (v_player_id, v_item.id)
    on conflict do nothing;
  else
    insert into public.player_owned_backgrounds (player_id, background_id)
    values (v_player_id, v_item.id)
    on conflict do nothing;
  end if;

  perform private.sync_achievements(v_player_id);

  return public.player_dashboard(v_player_id);
end;
$$;

create or replace function public.redeem_code(p_session_token text, p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_player_id uuid;
  v_code public.redemption_codes%rowtype;
  v_uses integer;
begin
  v_player_id := private.require_player_id(p_session_token);

  select * into v_code
  from public.redemption_codes
  where code = trim(p_code)::citext and active = true;

  if v_code.code is null then
    raise exception 'Invalid code';
  end if;

  select count(*) into v_uses
  from public.player_code_redemptions
  where player_id = v_player_id and code = v_code.code;

  if v_uses >= v_code.max_uses_per_player then
    raise exception 'Code already used';
  end if;

  update public.players
  set coins = coins + v_code.reward_coins
  where id = v_player_id;

  insert into public.player_code_redemptions (player_id, code, reward_coins)
  values (v_player_id, v_code.code, v_code.reward_coins);

  return public.player_dashboard(v_player_id);
end;
$$;

create or replace function public.record_game_result(
  p_session_token text,
  p_mode public.game_mode,
  p_difficulty public.difficulty_level,
  p_score integer,
  p_accuracy integer,
  p_correct_keystrokes integer default null,
  p_total_keystrokes integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_player_id uuid;
begin
  v_player_id := private.require_player_id(p_session_token);

  insert into public.game_results (
    player_id,
    mode,
    difficulty,
    score,
    accuracy,
    correct_keystrokes,
    total_keystrokes,
    coins_earned
  )
  values (
    v_player_id,
    p_mode,
    p_difficulty,
    greatest(p_score, 0),
    greatest(least(p_accuracy, 100), 0),
    p_correct_keystrokes,
    p_total_keystrokes,
    greatest(p_score, 0)
  );

  update public.players
  set
    coins = coins + greatest(p_score, 0),
    total_points_earned = total_points_earned + greatest(p_score, 0),
    games_played = games_played + 1,
    best_score = greatest(best_score, greatest(p_score, 0)),
    best_accuracy = greatest(best_accuracy, greatest(least(p_accuracy, 100), 0))
  where id = v_player_id;

  insert into public.player_mode_stats (
    player_id,
    mode,
    games_played,
    best_score,
    best_accuracy,
    total_points
  )
  values (
    v_player_id,
    p_mode,
    1,
    greatest(p_score, 0),
    greatest(least(p_accuracy, 100), 0),
    greatest(p_score, 0)
  )
  on conflict (player_id, mode) do update set
    games_played = public.player_mode_stats.games_played + 1,
    best_score = greatest(public.player_mode_stats.best_score, excluded.best_score),
    best_accuracy = greatest(public.player_mode_stats.best_accuracy, excluded.best_accuracy),
    total_points = public.player_mode_stats.total_points + excluded.total_points,
    updated_at = now();

  perform private.sync_achievements(v_player_id);

  return public.player_dashboard(v_player_id);
end;
$$;

drop function if exists public.list_leaderboard(public.game_mode, integer);

create or replace function public.list_leaderboard(p_mode public.game_mode default null, p_limit integer default 10)
returns table (
  username citext,
  display_name text,
  avatar_name text,
  avatar text,
  best_score integer,
  best_accuracy integer,
  total_points_earned integer,
  games_played integer,
  achievements_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.username,
    coalesce(nullif(p.display_name, ''), p.username::text) as display_name,
    p.avatar_name,
    p.avatar,
    coalesce(ms.best_score, p.best_score) as best_score,
    coalesce(ms.best_accuracy, p.best_accuracy) as best_accuracy,
    p.total_points_earned,
    coalesce(ms.games_played, p.games_played) as games_played,
    count(pa.achievement_id) as achievements_count
  from public.players p
  left join public.player_mode_stats ms
    on ms.player_id = p.id
   and (p_mode is not null and ms.mode = p_mode)
  left join public.player_achievements pa on pa.player_id = p.id
  where (p_mode is null and p.games_played > 0)
     or (p_mode is not null and ms.games_played > 0)
  group by p.id, ms.best_score, ms.best_accuracy, ms.games_played
  order by coalesce(ms.best_score, p.best_score) desc, p.total_points_earned desc
  limit greatest(least(p_limit, 50), 1)
$$;

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

-- Lock tables down for browser clients. Use RPC functions above from the app.
alter table public.players enable row level security;
alter table public.player_sessions enable row level security;
alter table public.shop_items enable row level security;
alter table public.player_owned_avatars enable row level security;
alter table public.player_owned_backgrounds enable row level security;
alter table public.player_unlocked_themes enable row level security;
alter table public.player_shop_purchases enable row level security;
alter table public.game_results enable row level security;
alter table public.player_mode_stats enable row level security;
alter table public.achievements enable row level security;
alter table public.player_achievements enable row level security;
alter table public.redemption_codes enable row level security;
alter table public.player_code_redemptions enable row level security;
alter table public.public_chat_messages enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_thread_members enable row level security;
alter table public.chat_messages enable row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant execute on function public.create_player(text, text) to anon, authenticated;
grant execute on function public.login_player(text, text) to anon, authenticated;
grant execute on function public.logout_player(text) to anon, authenticated;
grant execute on function public.get_my_dashboard(text) to anon, authenticated;
grant execute on function public.get_player_dashboard(text) to anon, authenticated;
grant execute on function public.update_player_style(text, text, text) to anon, authenticated;
grant execute on function public.update_player_profile(text, text, text, text, text) to anon, authenticated;
grant execute on function public.unlock_theme(text, text) to anon, authenticated;
grant execute on function public.purchase_shop_item(text, public.shop_item_type, text) to anon, authenticated;
grant execute on function public.redeem_code(text, text) to anon, authenticated;
grant execute on function public.record_game_result(text, public.game_mode, public.difficulty_level, integer, integer, integer, integer) to anon, authenticated;
grant execute on function public.list_leaderboard(public.game_mode, integer) to anon, authenticated;
grant execute on function public.list_public_chat(integer) to anon, authenticated;
grant execute on function public.post_public_chat(text, text) to anon, authenticated;
grant execute on function public.list_chat_players(text) to anon, authenticated;
grant execute on function public.list_chat_threads(text) to anon, authenticated;
grant execute on function public.create_chat_thread(text, text[], text) to anon, authenticated;
grant execute on function public.add_chat_member(text, uuid, text) to anon, authenticated;
grant execute on function public.list_chat_messages(text, uuid, integer) to anon, authenticated;
grant execute on function public.post_chat_message(text, uuid, text) to anon, authenticated;

notify pgrst, 'reload schema';
