-- Anotações fixas do usuário (um texto por conta), exibidas na aba Progresso.

create table public.user_notes (
  user_id    uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  note       text not null check (char_length(note) between 1 and 2000),
  updated_at timestamptz not null default now()
);

revoke all on public.user_notes from anon;
revoke truncate, references, trigger on public.user_notes from authenticated;
grant select, insert, update, delete on public.user_notes to authenticated;

alter table public.user_notes enable row level security;

create policy user_notes_select on public.user_notes for select to authenticated using ((select auth.uid()) = user_id);
create policy user_notes_insert on public.user_notes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy user_notes_update on public.user_notes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy user_notes_delete on public.user_notes for delete to authenticated using ((select auth.uid()) = user_id);
