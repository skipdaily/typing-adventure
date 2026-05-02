-- Adds editable profile fields separate from the locked login username.
-- Run this once in Supabase SQL Editor.

alter table public.players
  add column if not exists display_name text not null default '',
  add column if not exists avatar_name text not null default 'Guide';

update public.players
set display_name = username::text
where display_name = '';

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

grant execute on function public.update_player_profile(text, text, text, text, text) to anon, authenticated;
grant execute on function public.list_leaderboard(public.game_mode, integer) to anon, authenticated;
