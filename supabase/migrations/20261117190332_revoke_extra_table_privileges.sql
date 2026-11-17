-- Privilégio mínimo: o app só usa select, insert, update e delete.
-- TRUNCATE ignora a RLS; REFERENCES e TRIGGER não são necessários ao papel authenticated.
revoke truncate, references, trigger on
  public.profiles, public.food_entries, public.water_logs,
  public.weight_logs, public.custom_foods
from authenticated, anon;
