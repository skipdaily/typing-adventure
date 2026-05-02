-- Run this before seed_shop_items.sql if Supabase says:
-- "there is no unique or exclusion constraint matching the ON CONFLICT specification"
--
-- It updates shop_items so avatar/fairy and background/fairy can both exist.

alter table public.player_owned_avatars
  drop constraint if exists player_owned_avatars_avatar_id_fkey,
  drop constraint if exists player_owned_avatars_item_fkey;

alter table public.player_owned_backgrounds
  drop constraint if exists player_owned_backgrounds_background_id_fkey,
  drop constraint if exists player_owned_backgrounds_item_fkey;

alter table public.player_shop_purchases
  drop constraint if exists player_shop_purchases_item_id_fkey,
  drop constraint if exists player_shop_purchases_item_fkey;

alter table public.shop_items
  drop constraint if exists shop_items_pkey;

alter table public.shop_items
  add constraint shop_items_pkey primary key (item_type, id);

alter table public.player_owned_avatars
  add column if not exists item_type public.shop_item_type not null default 'avatar';

alter table public.player_owned_avatars
  drop constraint if exists player_owned_avatars_item_type_check;

alter table public.player_owned_avatars
  add constraint player_owned_avatars_item_type_check check (item_type = 'avatar');

alter table public.player_owned_avatars
  add constraint player_owned_avatars_item_fkey
  foreign key (item_type, avatar_id)
  references public.shop_items(item_type, id)
  on delete restrict;

alter table public.player_owned_backgrounds
  add column if not exists item_type public.shop_item_type not null default 'background';

alter table public.player_owned_backgrounds
  drop constraint if exists player_owned_backgrounds_item_type_check;

alter table public.player_owned_backgrounds
  add constraint player_owned_backgrounds_item_type_check check (item_type = 'background');

alter table public.player_owned_backgrounds
  add constraint player_owned_backgrounds_item_fkey
  foreign key (item_type, background_id)
  references public.shop_items(item_type, id)
  on delete restrict;

alter table public.player_shop_purchases
  add constraint player_shop_purchases_item_fkey
  foreign key (item_type, item_id)
  references public.shop_items(item_type, id)
  on delete restrict;
