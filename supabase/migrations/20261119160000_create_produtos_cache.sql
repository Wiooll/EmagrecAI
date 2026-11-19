-- Cache de produtos consultados por código de barras (fonte: Open Food Facts, licença ODbL).
-- Só a função "consultar-codigo", com a chave de serviço, lê e grava. O app nunca acessa a tabela.
create table public.produtos_cache (
  codigo        text primary key check (codigo ~ '^[0-9]{8,14}$'),
  nome          text not null check (char_length(nome) between 1 and 120),
  marca         text check (marca is null or char_length(marca) <= 60),
  kcal100       numeric not null check (kcal100 between 0 and 900),
  carbs100      numeric not null check (carbs100 between 0 and 100),
  protein100    numeric not null check (protein100 between 0 and 100),
  fat100        numeric not null check (fat100 between 0 and 100),
  porcao_g      numeric check (porcao_g is null or porcao_g between 0 and 1000),
  porcao_rotulo text check (porcao_rotulo is null or char_length(porcao_rotulo) <= 60),
  fonte         text not null default 'openfoodfacts' check (fonte = 'openfoodfacts'),
  obtido_em     timestamptz not null default now(),
  check (carbs100 + protein100 + fat100 <= 105)
);
comment on table public.produtos_cache is 'Produtos consultados por código de barras. Acesso somente pela função consultar-codigo.';
comment on column public.produtos_cache.obtido_em is 'Quando o dado foi obtido. A função considera válido por 30 dias.';

-- RLS ativada, sem políticas e sem privilégios para anon e authenticated.
-- A chave de serviço da função ignora a RLS.
alter table public.produtos_cache enable row level security;
revoke all on public.produtos_cache from anon, authenticated;
