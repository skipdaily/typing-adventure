-- Run this if Magic Shop purchases fail or the app says it cannot find
-- public.purchase_shop_item(...) in the schema cache.
--
-- This replaces the purchase RPC with a text-based signature that PostgREST
-- matches reliably, then reloads Supabase's schema cache.

drop function if exists public.purchase_shop_item(text, public.shop_item_type, text);
drop function if exists public.purchase_shop_item(text, text, text);

create or replace function public.purchase_shop_item(
  p_session_token text,
  p_item_type text,
  p_item_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_player_id uuid;
  v_item_type public.shop_item_type;
  v_item public.shop_items%rowtype;
  v_coins integer;
begin
  begin
    v_item_type := trim(p_item_type)::public.shop_item_type;
  exception
    when invalid_text_representation then
      raise exception 'Invalid shop item type';
  end;

  v_player_id := private.require_player_id(p_session_token);

  select * into v_item
  from public.shop_items
  where item_type = v_item_type
    and id = trim(p_item_id)
    and active = true;

  if v_item.id is null then
    raise exception 'Shop item not found. Run supabase/seed_shop_items.sql in Supabase SQL Editor.';
  end if;

  select coins into v_coins
  from public.players
  where id = v_player_id
  for update;

  if v_coins < v_item.price then
    raise exception 'Not enough coins';
  end if;

  if v_item.item_type = 'avatar' and exists (
    select 1
    from public.player_owned_avatars
    where player_id = v_player_id
      and avatar_id = v_item.id
  ) then
    return public.player_dashboard(v_player_id);
  end if;

  if v_item.item_type = 'background' and exists (
    select 1
    from public.player_owned_backgrounds
    where player_id = v_player_id
      and background_id = v_item.id
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

grant execute on function public.purchase_shop_item(text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');

select
  routine_schema,
  routine_name,
  data_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'purchase_shop_item';
