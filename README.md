# O Mundo da IA — Robô Diário 🤖

Publica **2 artigos por dia** sobre Inteligência Artificial no blog automaticamente (via GitHub Actions).
Blog: https://omundodaia.blogspot.com/ — mesma máquina do "Dinheiro no Dia a Dia".

## Secrets (Settings → Secrets and variables → Actions)
- `BLOGGER_CLIENT_ID`, `BLOGGER_CLIENT_SECRET`, `BLOGGER_REFRESH_TOKEN`, `BLOGGER_BLOG_ID`
- `OPENROUTER_API_KEY` — IA que escreve
- `GOOGLE_SA_JSON` — indexação instantânea (Google Indexing API)
- `IMG_BASE` — serviço de imagens WebP (opcional)

## Horários
Todo dia às **10h e 21h** (Brasília). Rodar manual: aba Actions → Run workflow.

## Mais temas
Edite o array `POOL` em `scripts/daily-post.js`.
