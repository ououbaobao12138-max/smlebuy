-- Run this file in the Supabase SQL Editor before using /admin.

create table if not exists public.team_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

alter table public.team_members enable row level security;

drop policy if exists "Team members can read their own role" on public.team_members;
create policy "Team members can read their own role"
on public.team_members for select to authenticated
using (auth.uid() = user_id);

alter table public.products enable row level security;
alter table public.shop_products enable row level security;

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
on public.products for select using (true);

drop policy if exists "Team can manage products" on public.products;
create policy "Team can manage products"
on public.products for all to authenticated
using (exists (
  select 1 from public.team_members
  where user_id = auth.uid() and role in ('admin', 'editor')
))
with check (exists (
  select 1 from public.team_members
  where user_id = auth.uid() and role in ('admin', 'editor')
));

drop policy if exists "Public can read shop products" on public.shop_products;
create policy "Public can read shop products"
on public.shop_products for select using (true);

drop policy if exists "Team can manage shop products" on public.shop_products;
create policy "Team can manage shop products"
on public.shop_products for all to authenticated
using (exists (
  select 1 from public.team_members
  where user_id = auth.uid() and role in ('admin', 'editor')
))
with check (exists (
  select 1 from public.team_members
  where user_id = auth.uid() and role in ('admin', 'editor')
));

-- After creating each user in Authentication > Users, add its copied UUID here:
-- insert into public.team_members (user_id, role)
-- values ('PASTE-USER-UUID-HERE', 'admin');
