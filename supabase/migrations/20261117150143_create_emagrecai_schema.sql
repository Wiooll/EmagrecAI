-- EmagrecAI: esquema inicial (perfil, diário, água, peso e alimentos personalizados).
-- Cada tabela pertence a um usuário (user_id) e é protegida por Row Level Security.

-- 1. Tabelas ---------------------------------------------------------------

create table public.profiles (
  user_id          uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  sex              text    not null default 'f'   check (sex in ('f', 'm')),
  age              integer not null default 30     check (age between 1 and 120),
  height_cm        numeric not null default 165    check (height_cm between 50 and 300),
  weight_kg        numeric not null default 70     check (weight_kg between 10 and 500),
  target_weight_kg numeric not null default 65     check (target_weight_kg between 10 and 500),
  activity         numeric not null default 1.375  check (activity between 1 and 3),
  goal             text    not null default 'lose' check (goal in ('lose', 'keep', 'gain')),
  kcal_goal        integer not null default 1800   check (kcal_goal between 500 and 10000),
  water_goal_ml    integer not null default 2000   check (water_goal_ml between 0 and 20000),
  updated_at       timestamptz not null default now()
);

create table public.food_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day        date not null,
  meal       text not null check (meal in ('cafe', 'almoco', 'jantar', 'lanche')),
  name       text not null check (char_length(name) between 1 and 120),
  grams      numeric not null check (grams > 0 and grams <= 100000),
  qty_label  text not null default '' check (char_length(qty_label) <= 80),
  kcal       numeric not null check (kcal between 0 and 1000000),
  carbs      numeric not null check (carbs between 0 and 1000000),
  protein    numeric not null check (protein between 0 and 1000000),
  fat        numeric not null check (fat between 0 and 1000000),
  created_at timestamptz not null default now()
);
create index food_entries_user_day_idx on public.food_entries (user_id, day);

create table public.water_logs (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day     date not null,
  ml      integer not null check (ml between 0 and 20000),
  primary key (user_id, day)
);

create table public.weight_logs (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day     date not null,
  kg      numeric not null check (kg between 10 and 500),
  primary key (user_id, day)
);

create table public.custom_foods (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 120),
  kcal          numeric not null check (kcal between 0 and 20000),
  carbs         numeric not null check (carbs between 0 and 1000),
  protein       numeric not null check (protein between 0 and 1000),
  fat           numeric not null check (fat between 0 and 1000),
  unit_singular text not null check (char_length(unit_singular) between 1 and 40),
  unit_plural   text not null check (char_length(unit_plural) between 1 and 40),
  unit_grams    numeric not null check (unit_grams > 0 and unit_grams <= 100000),
  created_at    timestamptz not null default now()
);
create index custom_foods_user_idx on public.custom_foods (user_id);

-- 2. Permissões: nada para anon; somente authenticated, limitado pela RLS ------

revoke all on public.profiles, public.food_entries, public.water_logs,
              public.weight_logs, public.custom_foods from anon;
grant select, insert, update, delete on public.profiles, public.food_entries,
              public.water_logs, public.weight_logs, public.custom_foods to authenticated;

-- 3. Row Level Security ---------------------------------------------------------

alter table public.profiles     enable row level security;
alter table public.food_entries enable row level security;
alter table public.water_logs   enable row level security;
alter table public.weight_logs  enable row level security;
alter table public.custom_foods enable row level security;

create policy profiles_select on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy profiles_insert on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy profiles_update on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy profiles_delete on public.profiles for delete to authenticated using ((select auth.uid()) = user_id);

create policy food_entries_select on public.food_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy food_entries_insert on public.food_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy food_entries_update on public.food_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy food_entries_delete on public.food_entries for delete to authenticated using ((select auth.uid()) = user_id);

create policy water_logs_select on public.water_logs for select to authenticated using ((select auth.uid()) = user_id);
create policy water_logs_insert on public.water_logs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy water_logs_update on public.water_logs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy water_logs_delete on public.water_logs for delete to authenticated using ((select auth.uid()) = user_id);

create policy weight_logs_select on public.weight_logs for select to authenticated using ((select auth.uid()) = user_id);
create policy weight_logs_insert on public.weight_logs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy weight_logs_update on public.weight_logs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy weight_logs_delete on public.weight_logs for delete to authenticated using ((select auth.uid()) = user_id);

create policy custom_foods_select on public.custom_foods for select to authenticated using ((select auth.uid()) = user_id);
create policy custom_foods_insert on public.custom_foods for insert to authenticated with check ((select auth.uid()) = user_id);
create policy custom_foods_update on public.custom_foods for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy custom_foods_delete on public.custom_foods for delete to authenticated using ((select auth.uid()) = user_id);
