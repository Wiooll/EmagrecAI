// Função "excluir-conta": apaga a conta de quem fez a chamada. As tabelas de dados têm
// "on delete cascade" em auth.users, então remover o usuário apaga também todos os dados dele.
//
// O app não tem backend próprio e a chave publicável não é um JWT, então a função não exige JWT
// no gateway (veja config.toml). A proteção é feita aqui: origem permitida, token de acesso
// validado no serviço de autenticação e exclusão apenas do usuário dono do token.
// Nenhum identificador vindo do corpo da requisição é usado.
//
// Variáveis de ambiente (nunca no repositório):
//   ORIGENS_PERMITIDAS    origens separadas por vírgula, ex.: "https://usuario.github.io,http://localhost:8000"
//   SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY  (fornecidas pelo Supabase)

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ORIGENS = (Deno.env.get("ORIGENS_PERMITIDAS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const TEMPO_LIMITE_MS = 8000;
const LIMITE_POR_REDE = 5; // pedidos por minuto, por endereço de rede (contador da instância)
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const porRede = new Map<string, { n: number; fim: number }>();

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

// Valida o token no serviço de autenticação e devolve o id do usuário, ou null.
async function usuarioDoToken(token: string): Promise<string | null> {
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    });
    if (!r.ok) return null;
    const u = await r.json();
    return typeof u?.id === "string" && UUID.test(u.id) ? u.id.toLowerCase() : null;
  } catch (_) {
    return null;
  }
}

async function excluirUsuario(id: string): Promise<boolean> {
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
      method: "DELETE",
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    });
    return r.ok;
  } catch (_) {
    return false; // sem registrar texto do serviço nem cabeçalhos
  }
}

Deno.serve(async (req) => {
  const origem = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origem) });
  if (req.method !== "POST") return erro(405, "metodo_nao_permitido", origem, { Allow: "POST, OPTIONS" });
  if (!origem || !ORIGENS.includes(origem)) return erro(403, "origem_nao_permitida", origem);
  if (!SUPABASE_URL || !SERVICE_KEY) return erro(502, "servico_indisponivel", origem);

  // Limite de pedidos por endereço de rede (contador em memória, por instância)
  const rede = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "desconhecido";
  const agora = Date.now();
  let c = porRede.get(rede);
  if (!c || agora > c.fim) {
    if (porRede.size > 5000) porRede.clear();
    c = { n: 0, fim: agora + 60000 };
    porRede.set(rede, c);
  }
  if (++c.n > LIMITE_POR_REDE) {
    return erro(429, "limite_excedido", origem, { "Retry-After": String(Math.max(1, Math.ceil((c.fim - agora) / 1000))) });
  }

  const m = /^Bearer\s+([\w-]+\.[\w-]+\.[\w-]+)$/.exec(req.headers.get("authorization") ?? "");
  if (!m) return erro(401, "nao_autenticado", origem);
  const id = await usuarioDoToken(m[1]);
  if (!id) return erro(401, "nao_autenticado", origem);

  if (!(await excluirUsuario(id))) return erro(502, "servico_indisponivel", origem);
  return resp(200, { ok: true }, origem);
});
