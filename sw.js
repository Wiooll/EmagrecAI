/* Service worker do EmagrecAI.
   Ao publicar uma nova versão do app, altere VERSAO aqui e no index.html (devem ser iguais).
   Só atende requisições GET de uma lista fechada de arquivos estáticos. Todo o resto (Supabase,
   login, qualquer outra origem) segue direto para a rede e nunca é guardado em cache. */
const VERSAO = "1.8.0";
const CACHE = "emagrecai-" + VERSAO;
const RAIZ = new URL("./", self.location).href;
const ARQUIVOS = ["manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png", "data/taco.json"];
const ESTATICOS = new Set(ARQUIVOS.map(p => new URL(p, RAIZ).href));
const SUPABASE_JS = /^https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@[\d.]+\//;
const FONTES = new Set(["https://fonts.googleapis.com", "https://fonts.gstatic.com"]);
const LIMITE_REDE_MS = 4000;

self.addEventListener("install", e => {
  /* Sem skipWaiting: a página avisa o usuário e só então pede a ativação (mensagem SKIP_WAITING). */
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(
    ["./", ...ARQUIVOS].map(u => c.add(new Request(u, { cache: "reload" })).catch(() => {}))
  )));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith("emagrecai-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", e => {
  if (e.data && e.data.t === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (r.mode === "navigate" && u.href.startsWith(RAIZ)) e.respondWith(navegar(r));
  else if (ESTATICOS.has(u.origin + u.pathname)) e.respondWith(cachePrimeiro(r));
  else if (SUPABASE_JS.test(r.url)) e.respondWith(cachePrimeiro(r));
  else if (FONTES.has(u.origin)) e.respondWith(atualizarEmSegundoPlano(e, r));
});

/* Navegação: rede primeiro (limite de 4 s); sem rede, usa a cópia guardada.
   A cópia é sempre gravada sob a chave da raiz, nunca sob uma URL com query (por exemplo, o ?code= do login). */
async function navegar(r) {
  const c = await caches.open(CACHE);
  const rede = fetch(r);
  rede.then(res => { if (res.ok) c.put(RAIZ, res.clone()); }).catch(() => {});
  try {
    return await Promise.race([rede, new Promise((_, rej) => setTimeout(() => rej(new Error("limite")), LIMITE_REDE_MS))]);
  } catch (err) {
    return (await c.match(RAIZ)) || rede;
  }
}

async function cachePrimeiro(r) {
  const c = await caches.open(CACHE);
  const guardado = await c.match(r);
  if (guardado) return guardado;
  const res = await fetch(r);
  if (res.ok) c.put(r, res.clone());
  return res;
}

async function atualizarEmSegundoPlano(e, r) {
  const c = await caches.open(CACHE);
  const guardado = await c.match(r);
  const rede = fetch(r).then(res => {
    if (res.ok || res.type === "opaque") c.put(r, res.clone());
    return res;
  }).catch(() => null);
  if (guardado) { e.waitUntil(rede); return guardado; }
  return (await rede) || Response.error();
}
