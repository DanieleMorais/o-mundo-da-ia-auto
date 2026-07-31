// Robô diário: publica 1 artigo premium sobre INTELIGÊNCIA ARTIFICIAL no blog "IA no Dia a Dia".
// Rodado pelo GitHub Actions. Credenciais vêm de secrets. Mesma máquina do blog de finanças.
const CLIENT_ID = process.env.BLOGGER_CLIENT_ID;
const CLIENT_SECRET = process.env.BLOGGER_CLIENT_SECRET;
const REFRESH = process.env.BLOGGER_REFRESH_TOKEN;
const BLOG_ID = process.env.BLOGGER_BLOG_ID;
const IMG_BASE = process.env.IMG_BASE || ""; // ex: https://img.ianodiaadia.com  (vazio = usa Pollinations direto)

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH || !BLOG_ID) {
  console.error("❌ Faltam secrets do Blogger.");
  process.exit(1);
}

const NEWS_Q = {
  Modelos: "novo modelo IA GPT Gemini Claude LLM lançamento",
  Ferramentas: "nova ferramenta IA inteligência artificial app",
  ChatGPT: "ChatGPT OpenAI novidade recurso",
  Imagem: "IA geração de imagem Midjourney arte inteligência artificial",
  Video: "IA geração de vídeo Sora inteligência artificial",
  Negocios: "IA empresas produtividade automação trabalho",
  Tutorial: "como usar inteligência artificial dicas prompt",
  Ciencia: "avanço inteligência artificial pesquisa IA",
};
const IMG_Q = {
  Modelos: "artificial intelligence neural network futuristic",
  Ferramentas: "ai software app technology interface neon",
  ChatGPT: "chatbot ai conversation technology glow",
  Imagem: "ai generated art creative technology colorful",
  Video: "ai video generation futuristic screen",
  Negocios: "ai business automation office technology",
  Tutorial: "person using ai laptop technology",
  Ciencia: "artificial intelligence science research futuristic",
};
const CAT_LABEL = { Modelos: "Modelos de IA", Ferramentas: "Ferramentas de IA", ChatGPT: "ChatGPT", Imagem: "IA de Imagem", Video: "IA de Vídeo", Negocios: "IA nos Negócios", Tutorial: "Tutoriais", Ciencia: "Ciência & Pesquisa" };

// Pool grande de temas de IA (o robô escolhe um ainda não publicado)
const POOL = [
  ["o que é inteligência artificial e como ela funciona na prática", "Ciencia"],
  ["como usar o ChatGPT: guia completo para iniciantes", "ChatGPT"],
  ["os melhores prompts de ChatGPT para produtividade", "ChatGPT"],
  ["ChatGPT grátis x pago: vale a pena assinar?", "ChatGPT"],
  ["as melhores ferramentas de IA gratuitas em 2026", "Ferramentas"],
  ["como criar imagens com inteligência artificial de graça", "Imagem"],
  ["as melhores IAs para gerar imagens comparadas", "Imagem"],
  ["como gerar vídeos com IA: ferramentas e passo a passo", "Video"],
  ["como usar IA para estudar e aprender mais rápido", "Tutorial"],
  ["como ganhar dinheiro usando inteligência artificial", "Negocios"],
  ["IA para pequenas empresas: como automatizar tarefas", "Negocios"],
  ["Gemini, ChatGPT ou Claude: qual a melhor IA?", "Modelos"],
  ["o que são LLMs (grandes modelos de linguagem) explicado simples", "Modelos"],
  ["como criar um assistente de IA para o seu negócio", "Negocios"],
  ["as melhores IAs para escrever textos e artigos", "Ferramentas"],
  ["IA para edição de vídeo: as melhores ferramentas", "Video"],
  ["como usar IA para criar apresentações e slides", "Ferramentas"],
  ["prompt engineering: como escrever prompts que funcionam", "Tutorial"],
  ["IA na medicina: como está transformando a saúde", "Ciencia"],
  ["agentes de IA: o que são e como vão mudar tudo", "Modelos"],
  ["como detectar textos e imagens feitos por IA", "Tutorial"],
  ["as melhores IAs para programadores e código", "Ferramentas"],
  ["IA de voz: como clonar e gerar vozes realistas", "Ferramentas"],
  ["como usar IA no marketing digital e redes sociais", "Negocios"],
  ["inteligência artificial vai substituir empregos? o que se sabe", "Ciencia"],
  ["como criar um chatbot com IA sem saber programar", "Tutorial"],
  ["as melhores ferramentas de IA para design gráfico", "Imagem"],
  ["IA para criar músicas: ferramentas e como usar", "Ferramentas"],
  ["como usar IA para planejar viagens e roteiros", "Tutorial"],
  ["assistentes de IA no celular: quais valem a pena", "Ferramentas"],
  ["como a IA generativa funciona por trás dos panos", "Ciencia"],
  ["IA e privacidade: como proteger seus dados", "Ciencia"],
  ["as profissões do futuro com inteligência artificial", "Negocios"],
  ["como automatizar seu trabalho com IA em 2026", "Negocios"],
  ["ferramentas de IA para criar conteúdo em vídeo", "Video"],
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const norm = s => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
function slugify(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "ia"; }

async function getToken() {
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, refresh_token: REFRESH, grant_type: "refresh_token" }) });
  const j = await r.json();
  if (!j.access_token) throw new Error("token: " + JSON.stringify(j));
  return j.access_token;
}

async function titulosExistentes() {
  try {
    const r = await fetch(`https://www.blogger.com/feeds/${BLOG_ID}/posts/default?alt=json&max-results=500`, { headers: { "User-Agent": "Mozilla/5.0" } });
    return (((await r.json()).feed || {}).entry || []).map(e => norm(e.title.$t));
  } catch { return []; }
}

async function buscarNoticias(catKey) {
  const query = NEWS_Q[catKey] || "inteligência artificial";
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query + " when:30d")}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(9000) });
    const xml = await r.text();
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    return items.slice(0, 4).map(it => {
      const g = re => { const m = it.match(re); return m ? m[1] : ""; };
      return { titulo: (g(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/) || "").replace(/&amp;/g, "&"), fonte: g(/<source[^>]*>(.*?)<\/source>/) };
    }).filter(n => n.titulo);
  } catch { return []; }
}

const OR_KEY = process.env.OPENROUTER_API_KEY || "";
async function callAI(prompt) {
  const GK = process.env.GEMINI_API_KEY;
  if (GK) for (const model of ["gemini-3.1-flash-lite", "gemini-flash-latest"]) for (let t = 0; t < 3; t++) { try { const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GK}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.85, maxOutputTokens: 8000 } }), signal: AbortSignal.timeout(120000) }); if (r.status === 429 || r.status >= 500) { await sleep(15000); continue; } if (!r.ok) break; const c = ((await r.json()).candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim(); if (c && c.length > 400) return c; } catch { await sleep(6000); } }
  for (let t = 0; t < 4; t++) { try { const r = await fetch("https://text.pollinations.ai/openai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ model: "openai-fast", messages: [{ role: "user", content: prompt }], temperature: 0.8 }), signal: AbortSignal.timeout(90000) }); if (r.status === 429) { await sleep(20000); continue; } if (!r.ok) { await sleep(8000); continue; } const c = (await r.json()).choices?.[0]?.message?.content?.trim(); if (c && c.length > 400) return c; } catch { await sleep(6000); } }
  if (OR_KEY) for (const model of ["google/gemma-4-31b-it:free", "openai/gpt-oss-20b:free"]) for (let t = 0; t < 2; t++) { try { const r = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { Authorization: "Bearer " + OR_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], temperature: 0.85, max_tokens: 6000 }), signal: AbortSignal.timeout(90000) }); if (r.status === 429 || r.status >= 500) { await sleep(12000); continue; } if (!r.ok) break; const c = (await r.json()).choices?.[0]?.message?.content?.trim(); if (c && c.length > 400) return c; } catch { await sleep(5000); } }
  return null;
}

async function gerar(tema, noticias) {
  const ctx = noticias.length ? `\n\nNOTÍCIAS RECENTES SOBRE IA (use 1-2 como gancho na abertura, cite a fonte; NÃO invente números):\n${noticias.map(n => "- " + n.titulo + " (" + n.fonte + ")").join("\n")}` : "";
  const prompt = `Você é editor(a)-chefe de um portal premium sobre Inteligência Artificial no Brasil. Escreva um artigo EXTREMAMENTE PREMIUM, aprofundado, atual e original em português sobre: "${tema}".${ctx}\n\nEXIGÊNCIAS: 1000-1500 palavras, prático e específico (passos, exemplos, ferramentas reais, dicas). Abertura ancorada na atualidade da IA. 5-7 <h2> com <h3>, <ul><li> e onde couber UMA <table> comparativa. Tom de autoridade e didático, use você. Seção <h2>Perguntas frequentes</h2> com 4 <h3>. NÃO invente dados/preços exatos. NÃO se identifique como IA. NÃO escreva html/head/body/h1 nem markdown.\n\nFORMATO (exato):\nLinha 1: TITULO: <título até 65 caracteres>\nLinha 2: RESUMO: <1-2 frases valiosas>\nDepois: corpo em HTML puro (começando com <p>).`;
  const c = await callAI(prompt);
  if (!c) return null;
  const titulo = (c.match(/TITULO:\s*(.+)/i)?.[1] || tema).trim().replace(/^["#*\s]+|["*\s]+$/g, "").slice(0, 70);
  const resumo = (c.match(/RESUMO:\s*(.+)/i)?.[1] || "").trim();
  let corpo = /RESUMO:/i.test(c) ? c.replace(/^[\s\S]*?RESUMO:.*(?:\r?\n)+/i, "").trim() : c.replace(/^[\s\S]*?TITULO:.*(?:\r?\n)+/i, "").trim();
  corpo = corpo.replace(/^```(?:html)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  return corpo.length >= 500 ? { titulo, resumo, corpo } : null;
}

function montar(art, img, tema, noticias) {
  const alt = (art.titulo || tema || "inteligência artificial").replace(/"/g, "");
  const fig = `<figure style="margin:0 0 24px"><img src="${img}" alt="${alt}" title="${alt}" style="width:100%;height:auto;border-radius:14px" /></figure>`;
  const tl = art.resumo ? `<div style="background:linear-gradient(135deg,#eef2ff,#f5f0ff);border-left:5px solid #7c3aed;padding:18px 22px;border-radius:12px;margin:0 0 26px;font-size:1.05em"><strong style="color:#6d28d9">🤖 Resumo rápido:</strong> ${art.resumo}</div>` : "";
  const fontes = noticias.length ? `\n<div style="background:#fafafa;border:1px solid #eee;border-radius:12px;padding:14px 18px;margin:26px 0;font-size:.9em;color:#555"><strong>Contexto e atualidade:</strong> considera o noticiário recente sobre IA${noticias[0]?.fonte ? " (como " + noticias[0].fonte + ")" : ""}.</div>` : "";
  const aviso = `\n<p style="font-size:.88em;color:#777;border-top:1px solid #eee;padding-top:14px;margin-top:28px"><em>Conteúdo informativo sobre tecnologia e IA. Ferramentas e recursos podem mudar; confira sempre a fonte oficial.</em></p>`;
  return fig + tl + art.corpo + fontes + aviso;
}

const crypto = require("crypto");
function b64url(x) { return Buffer.from(x).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_"); }
async function notifyGoogle(postUrl) {
  const raw = process.env.GOOGLE_SA_JSON;
  if (!raw || !postUrl) return;
  try {
    const sa = JSON.parse(raw);
    const now = Math.floor(Date.now() / 1000);
    const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claim = b64url(JSON.stringify({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/indexing", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
    const sig = b64url(crypto.sign("RSA-SHA256", Buffer.from(header + "." + claim), sa.private_key));
    const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: header + "." + claim + "." + sig }) });
    const tk = (await tr.json()).access_token;
    if (!tk) return;
    const r = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", { method: "POST", headers: { Authorization: "Bearer " + tk, "Content-Type": "application/json" }, body: JSON.stringify({ url: postUrl, type: "URL_UPDATED" }) });
    console.log("Indexing API:", r.status === 200 ? "✅ Google avisado" : "status " + r.status);
  } catch (e) { console.log("Indexing API erro:", e.message); }
}

(async () => {
  const existentes = await titulosExistentes();
  const jaTem = tema => { const w = norm(tema).split(" ").filter(x => x.length > 3); return existentes.some(t => w.filter(x => t.includes(x)).length >= Math.max(3, Math.ceil(w.length * 0.6))); };
  const candidatos = POOL.filter(([tema]) => !jaTem(tema));
  if (!candidatos.length) { console.log("Pool esgotado — adicione novos temas."); return; }
  const [tema, catKey] = candidatos[Math.floor(Math.random() * candidatos.length)];
  console.log("Tema:", tema, "| cat:", catKey, "| candidatos:", candidatos.length);

  const noticias = await buscarNoticias(catKey);
  const art = await gerar(tema, noticias);
  if (!art) { console.error("❌ Geração de IA falhou."); process.exit(1); }
  const seed = Math.floor(Date.now() % 999999);
  const iq = IMG_Q[catKey] || "artificial intelligence futuristic";
  const img = IMG_BASE
    ? `${IMG_BASE}/${slugify(art.titulo)}.webp?q=${encodeURIComponent(iq)}&s=${seed}`
    : `https://image.pollinations.ai/prompt/${encodeURIComponent(iq + " premium professional")}?width=1200&height=630&seed=${seed}&nologo=true`;
  const html = montar(art, img, tema, noticias);
  const label = CAT_LABEL[catKey] || "IA";

  const token = await getToken();
  const pr = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/?isDraft=false`, { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify({ kind: "blogger#post", title: art.titulo, content: html, labels: [label] }) });
  const pd = await pr.json();
  if (pd.url) { console.log("✅ PUBLICADO:", art.titulo, "→", pd.url); await notifyGoogle(pd.url); }
  else { console.error("❌ FALHA:", JSON.stringify(pd.error?.message || pd).slice(0, 200)); process.exit(1); }
})().catch(e => { console.error("FALHA GERAL:", e.message); process.exit(1); });
