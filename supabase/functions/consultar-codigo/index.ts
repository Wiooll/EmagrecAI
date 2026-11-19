// Função pública "consultar-codigo": busca um produto pelo código de barras no Open Food Facts,
// com cache em public.produtos_cache. O visitante não tem login, então a função não exige JWT
// (veja config.toml). A proteção é feita por validação do código, origem, limites e cache.
//
// Variáveis de ambiente (nunca no repositório):
//   OFF_USER_AGENT        ex.: "EmagrecAI/1.7 (contato@exemplo.com)"  (obrigatório pelo Open Food Facts)
//   ORIGENS_PERMITIDAS    origens separadas por vírgula, ex.: "https://usuario.github.io,http://localhost:8000"
//   SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY  (fornecidas pelo Supabase)

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const USER_AGENT = Deno.env.get("OFF_USER_AGENT") ?? "";
const ORIGENS = (Deno.env.get("ORIGENS_PERMITIDAS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const VALIDADE_CACHE_MS = 30 * 24 * 3600 * 1000;
const NAO_ENCONTRADO_MS = 3600 * 1000;
const TEMPO_LIMITE_MS = 5000;
const LIMITE_POR_ORIGEM = 30; // pedidos por minuto, por endereço de rede (contador da instância)
const LIMITE_EXTERNO = 20; // consultas ao Open Food Facts por minuto, por instância
const MAX_CORPO = 1024;

type Produto = {
  codigo: string;
  nome: string;
  marca: string | null;
  kcal100: number;
  c100: number;
  p100: number;
  f100: number;
  porcao_g: number | null;
  porcao_rotulo: string | null;
};

const naoEncontrados = new Map<string, number>();
const porOrigem = new Map<string, { n: number; fim: number }>();
let externo = { n: 0, fim: 0 };

function cors(origem: string | null): Record<string, string> {
  const h: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
    "Access-Control-Max-Age": "600",
    "Vary": "Origin",
  };
  if (origem && ORIGENS.includes(origem)) h["Access-Control-Allow-Origin"] = origem;
  return h;
}

function resp(status: number, corpo: unknown, origem: string | null, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...cors(origem), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra },
  });
}

const erro = (status: number, codigo: string, origem: string | null, extra: Record<string, string> = {}) =>
  resp(status, { erro: codigo }, origem, extra);

function gtinValido(c: string): boolean {
  if (!/^\d+$/.test(c) || ![8, 12, 13, 14].includes(c.length)) return false;
  let s = 0;
  for (let i = 0; i < c.length - 1; i++) s += Number(c[c.length - 2 - i]) * (i % 2 ? 1 : 3);
  return (10 - (s % 10)) % 10 === Number(c[c.length - 1]);
}

const limpa = (v: unknown, max: number): string =>
  // deno-lint-ignore no-control-regex
  typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";

const num = (v: unknown): number | null => {
  const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
};

const dentro = (v: number | null, max: number): v is number => v !== null && v >= 0 && v <= max;

// Valida e normaliza a resposta do Open Food Facts. Devolve null quando os dados não servem.
function normalizar(codigo: string, p: Record<string, unknown>): Produto | null {
  const nome = limpa(p.product_name, 120);
  const n = (p.nutriments ?? {}) as Record<string, unknown>;
  const k = num(n["energy-kcal_100g"]), c = num(n["carbohydrates_100g"]), pr = num(n["proteins_100g"]), f = num(n["fat_100g"]);
  if (!nome || !dentro(k, 900) || !dentro(c, 100) || !dentro(pr, 100) || !dentro(f, 100) || c + pr + f > 105) return null;
  const porcao = num(p.serving_quantity);
  const porcaoOk = porcao !== null && porcao > 0 && porcao <= 1000;
  return {
    codigo,
    nome,
    marca: limpa(String(p.brands ?? "").split(",")[0], 60) || null,
    kcal100: k,
    c100: c,
    p100: pr,
    f100: f,
    porcao_g: porcaoOk ? porcao : null,
    porcao_rotulo: porcaoOk ? limpa(p.serving_size, 60) || null : null,
  };
}

const cabecalhosBanco = () => ({ apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` });

type Linha = {
  codigo: string; nome: string; marca: string | null; kcal100: number; carbs100: number;
  protein100: number; fat100: number; porcao_g: number | null; porcao_rotulo: string | null; obtido_em: string;
};

async function lerCache(codigo: string): Promise<{ produto: Produto; recente: boolean } | null> {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/produtos_cache?codigo=eq.${codigo}&select=*&limit=1`, {
      headers: cabecalhosBanco(),
      signal: AbortSignal.timeout(3000),
    });
    if (!r.ok) return null;
    const l = ((await r.json()) as Linha[])[0];
    if (!l) return null;
    return {
      recente: Date.now() - new Date(l.obtido_em).getTime() < VALIDADE_CACHE_MS,
      produto: {
        codigo: l.codigo, nome: l.nome, marca: l.marca, kcal100: Number(l.kcal100), c100: Number(l.carbs100),
        p100: Number(l.protein100), f100: Number(l.fat100),
        porcao_g: l.porcao_g === null ? null : Number(l.porcao_g), porcao_rotulo: l.porcao_rotulo,
      },
    };
  } catch (_) {
    return null;
  }
}

async function gravarCache(p: Produto): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/produtos_cache?on_conflict=codigo`, {
      method: "POST",
      headers: { ...cabecalhosBanco(), "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        codigo: p.codigo, nome: p.nome, marca: p.marca, kcal100: p.kcal100, carbs100: p.c100, protein100: p.p100,
        fat100: p.f100, porcao_g: p.porcao_g, porcao_rotulo: p.porcao_rotulo, fonte: "openfoodfacts",
        obtido_em: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (_) {
    // falha ao gravar o cache não impede a resposta
  }
}

type Externo = { tipo: "ok"; produto: Produto } | { tipo: "nao_encontrado" | "dados_incompletos" | "indisponivel" };

async function consultarExterno(codigo: string): Promise<Externo> {
  const agora = Date.now();
  if (agora > externo.fim) externo = { n: 0, fim: agora + 60000 };
  if (++externo.n > LIMITE_EXTERNO) return { tipo: "indisponivel" };
  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${codigo}.json?fields=product_name,brands,nutriments,serving_quantity,serving_size`;
    const r = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    });
    if (r.status === 404) return { tipo: "nao_encontrado" };
    if (!r.ok) return { tipo: "indisponivel" };
    const j = await r.json();
    if (!j || j.status !== 1 || typeof j.product !== "object" || j.product === null) return { tipo: "nao_encontrado" };
    const p = normalizar(codigo, j.product);
    return p ? { tipo: "ok", produto: p } : { tipo: "dados_incompletos" };
  } catch (_) {
    return { tipo: "indisponivel" }; // sem registrar texto do provedor nem cabeçalhos
  }
}

Deno.serve(async (req) => {
  const origem = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origem) });
  if (req.method !== "POST") return erro(405, "codigo_invalido", origem, { Allow: "POST, OPTIONS" });
  if (!origem || !ORIGENS.includes(origem)) return erro(403, "origem_nao_permitida", origem);
  if (!SUPABASE_URL || !SERVICE_KEY || !USER_AGENT) return erro(502, "servico_indisponivel", origem);

  // Limite de pedidos por endereço de rede (contador em memória, por instância)
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "desconhecido";
  const agora = Date.now();
  let c = porOrigem.get(ip);
  if (!c || agora > c.fim) {
    if (porOrigem.size > 5000) porOrigem.clear();
    c = { n: 0, fim: agora + 60000 };
    porOrigem.set(ip, c);
  }
  if (++c.n > LIMITE_POR_ORIGEM) {
    return erro(429, "limite_excedido", origem, { "Retry-After": String(Math.max(1, Math.ceil((c.fim - agora) / 1000))) });
  }

  // Corpo: JSON de até 1 KB
  let codigo = "";
  try {
    if (!(req.headers.get("content-type") ?? "").includes("application/json")) throw new Error();
    const texto = await req.text();
    if (texto.length > MAX_CORPO) throw new Error();
    const corpo = JSON.parse(texto);
    codigo = typeof corpo?.codigo === "string" ? corpo.codigo : "";
  } catch (_) {
    return erro(400, "codigo_invalido", origem);
  }
  if (!gtinValido(codigo)) return erro(400, "codigo_invalido", origem);

  const nf = naoEncontrados.get(codigo);
  if (nf && agora - nf < NAO_ENCONTRADO_MS) return erro(404, "nao_encontrado", origem);

  const guardado = await lerCache(codigo);
  if (guardado?.recente) return resp(200, { produto: guardado.produto }, origem);

  const ext = await consultarExterno(codigo);
  if (ext.tipo === "ok") {
    await gravarCache(ext.produto);
    return resp(200, { produto: ext.produto }, origem);
  }
  // Consulta externa falhou: o dado antigo é melhor que nenhum
  if (guardado && ext.tipo === "indisponivel") return resp(200, { produto: guardado.produto }, origem);
  if (ext.tipo === "nao_encontrado") {
    if (naoEncontrados.size > 5000) naoEncontrados.clear();
    naoEncontrados.set(codigo, agora);
    return erro(404, "nao_encontrado", origem);
  }
  if (ext.tipo === "dados_incompletos") return erro(422, "dados_incompletos", origem);
  return erro(502, "servico_indisponivel", origem);
});
