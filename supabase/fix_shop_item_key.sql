-- Run this if you already ran the first schema.sql and then seed_shop_items.sql failed with:
-- "ON CONFLICT DO UPDATE command cannot affect row a second time"
--
-- It changes shop_items from globally unique id to unique per category:
--   primary key (item_type, id)

alter table if exists public.player_owned_avatars
  drop constraint if exists player_owned_avatars_avatar_id_fkey;

alter table if exists public.player_owned_backgrounds
  drop constraint if exists player_owned_backgrounds_background_id_fkey;

alter table if exists public.player_shop_purchases
  drop constraint if exists player_shop_purchases_item_id_fkey;

alter table if exists public.shop_items
  drop constraint if exists shop_items_pkey;

alter table if exists public.shop_items
  add primary key (item_type, id);

alter table if exists public.player_owned_avatars
  add column if not exists item_type public.shop_item_type not null default 'avatar';

alter table if exists public.player_owned_avatars
  drop constraint if exists player_owned_avatars_item_type_check;

alter table if exists public.player_owned_avatars
  add constraint player_owned_avatars_item_type_check check (item_type = 'avatar');

alter table if exists public.player_owned_avatars
  add constraint player_owned_avatars_item_fkey
  foreign key (item_type, avatar_id)
  references public.shop_items(item_type, id)
  on delete restrict;

alter table if exists public.player_owned_backgrounds
  add column if not exists item_type public.shop_item_type not null default 'background';

alter table if exists public.player_owned_backgrounds
  drop constraint if exists player_owned_backgrounds_item_type_check;

alter table if exists public.player_owned_backgrounds
  add constraint player_owned_backgrounds_item_type_check check (item_type = 'background');

alter table if exists public.player_owned_backgrounds
  add constraint player_owned_backgrounds_item_fkey
  foreign key (item_type, background_id)
  references public.shop_items(item_type, id)
  on delete restrict;

alter table if exists public.player_shop_purchases
  add constraint player_shop_purchases_item_fkey
  foreign key (item_type, item_id)
  references public.shop_items(item_type, id)
  on delete restrict;

drop function if exists public.purchase_shop_item(text, text);

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

grant execute on function public.purchase_shop_item(text, public.shop_item_type, text) to anon, authenticated;
