# IMOV Imobiliária — Documentação do Projeto

Plataforma de inteligência imobiliária regional focada em Fortaleza/CE.
Monorepo Turborepo + pnpm workspaces.

---

## Estado atual do projeto

### ✅ Implementado e funcionando

**Backend (API — `apps/api`)**
- Fastify 4 com Prisma 5 + PostgreSQL rodando em produção no VPS
- Autenticação JWT (cookie httpOnly + Bearer token para o admin cross-domain)
- Rate limiting por rota (10 req/min para leads, 60 req/min para imóveis)
- CORS com múltiplas origens (env var comma-separated)
- Todas as rotas públicas:
  - `GET /imoveis` — listagem com 12+ filtros + paginação + ordenação
  - `GET /imoveis/destaques` — 6 imóveis em destaque
  - `GET /imoveis/:slug` — detalhe + 4 similares
  - `GET /bairros` — listagem + filtros por cidade/perfil
  - `GET /bairros/:slug` — detalhe + estatísticas
  - `GET /bairros/:slug/imoveis` — imóveis do bairro
  - `POST /leads` — captura de lead com score automático
  - `GET /empreendimentos` — listagem + filtros
  - `GET /empreendimentos/:slug` — detalhe + unidades
  - `GET /artigos` — blog por categoria
  - `GET /artigos/:slug` — artigo + relacionados
  - `GET /seo/sitemap-urls` — URLs para sitemap dinâmico
  - `GET /health` — health check
- Todas as rotas admin (requerem JWT):
  - CRUD completo de imóveis (`GET/POST/PUT/PATCH/DELETE /admin/imoveis`)
  - Soft delete (status INATIVO, nunca apaga do banco)
  - Gestão de leads com status CRM e observações
  - Dashboard com métricas em tempo real
- Lead Scoring automático (0–100 pts baseado em telefone, email, interesse, comportamento, UTM)
- Ranking de imóvel automático (preço vs bairro, valorização, recência, financiamento, completude)
- Seeds de demonstração (15 imóveis, bairros de Fortaleza, user admin)

**Frontend (Web — `apps/web`)**
- Next.js 14 App Router deployado no Vercel
- Página home com CTA
- `/imoveis` — listagem com filtros por tipo e paginação
- `/imoveis/[slug]` — detalhe com fotos, specs, diferenciais, similares
- `/lancamentos` — imóveis marcados como novo=true
- Header fixo com logo e navegação
- `/admin/login` — autenticação com JWT em localStorage
- `/admin/dashboard` — métricas + últimos leads
- `/admin/imoveis` — tabela com filtros, status inline, destaque, CRUD
- `/admin/imoveis/novo` — formulário completo de criação
- `/admin/imoveis/[id]/editar` — formulário de edição
- `/admin/leads` — tabela com status CRM inline + modal de observações

**Design System (`packages/ui`)**
- `CardImovel` — variantes vertical/horizontal com placeholder
- `CardBairro` — com perfil colorido e gradiente fallback
- `Badge` — variantes: destaque, oportunidade, novo, mcmv
- `BadgeRanking` — classificação de oportunidade
- `Button`, `Input`, `Textarea`, `Skeleton`, `CardImovelSkeleton`
- Utilitários: `cn()`, `formatCurrency()`, `formatArea()`

**Infraestrutura — migrada para 100% gratuita (VPS desativada em 2026-06-30)**
- API Fastify rodando como função serverless na Vercel (`apps/api/api/index.ts` envolve o app Fastify existente — rotas, plugins de auth/cors/multipart/rate-limit não mudaram)
- Banco: Supabase Postgres (`DATABASE_URL` com pooler para runtime, `DIRECT_URL` sem pooler para migrations)
- Storage de fotos: Supabase Storage (já era usado antes da migração, sem mudança)
- Cron jobs (sync Google Meu Negócio, submit sitemap): Vercel Cron Jobs chamando rotas HTTP em `/api/cron/*` (substituem o `node-cron` que dependia de processo de longa duração)
- Domínio `imov.somar.ia.br` → Vercel (frontend)
- Domínio `api.somar.ia.br` → apontar para o novo projeto Vercel da API (reconfigurar DNS — antes apontava pra VPS)
- Deploy automático: push no `main` → Vercel builda e deploya (frontend e API, dois projetos Vercel separados com Root Directory `apps/web` e `apps/api`)
- **Redis não é mais cogitado**: nunca foi de fato usado no código (era só infra provisionada), removido do `.env.example` e do `docker-compose.yml`
- **Pipeline de importação de mídia (Google Drive) descontinuado**: rodava em um serviço externo (`pipeline-api.somar.ia.br`) que vivia na VPS perdida, fora deste repo. A tela `/admin/importacoes` foi desativada — ver TODO em `apps/web/src/lib/pipeline-api.ts`

---

### ⏳ Pendente / Incompleto

**Páginas públicas que faltam**
- `/bairros` — listagem de bairros (rota API existe, página não)
- `/bairros/[slug]` — detalhe de bairro com mapa e estatísticas
- `/empreendimentos` — listagem de lançamentos/empreendimentos
- `/empreendimentos/[slug]` — detalhe de empreendimento
- `/blog` — listagem de artigos
- `/blog/[slug]` — detalhe de artigo
- `/simulador` — simulador de financiamento
- `sitemap.xml` e `robots.txt` dinâmicos (rota SEO existe, página não)

**Admin — o que falta**
- Upload de fotos de imóveis (campo de URL manual por enquanto)
- Gerenciamento de bairros e empreendimentos
- Gestão de artigos/blog
- Gerenciamento de usuários (roles: ADMIN, CORRETOR, EDITOR)
- Exportar leads para CSV

**Dados reais**
- Campos `[DADO_REAL_A_IMPORTAR]` nos seeds (endereços, fotos, dados de construtoras)
- Preços médios por bairro (`precoM2MedioVenda`, `valorizacao12meses`) — necessários para o ranking funcionar corretamente
- Fotos reais dos imóveis

**Integrações Google (implementadas, precisam de variáveis no VPS)**
- Google Sheets — `GOOGLE_SHEETS_ID` e `secrets/google-service-account.json` no VPS
- Gmail/SMTP — `SMTP_PASS` (Senha de App) no VPS
- Google Analytics 4 — `GA4_MEASUREMENT_ID` e `GA4_API_SECRET` no VPS
- Google OAuth (Meu Negócio + Search Console) — autorização pelo admin necessária

**Integrações pendentes**
- WhatsApp click-to-chat nos imóveis (`NEXT_PUBLIC_WHATSAPP_NUMBER`)
- Google Tag Manager (`NEXT_PUBLIC_GTM_ID`)
- Mapa Leaflet nas páginas de imóvel e bairro (componente instalado, não usado)

---

## Infraestrutura

### ⚠️ VPS desativada (histórico — não usar mais)
O projeto rodava num VPS Ubuntu (`147.79.86.65`) com API via PM2, Postgres e Redis no host, e Nginx Proxy Manager (Docker) como reverse proxy. **Não temos mais acesso a essa VPS** — qualquer dado ou processo que só existia lá (banco antigo, `n8n`, `Evolution API`) foi perdido e não deve ser referenciado em deploys novos. As seções abaixo descrevem a infraestrutura atual.

### Vercel (Frontend + API)
Dois projetos Vercel separados a partir do mesmo monorepo:

| Projeto | Root Directory | Config | Domínio |
|---|---|---|---|
| Frontend (`@imov/web`) | `apps/web` | `apps/web/vercel.json` | `imov.somar.ia.br` |
| API (`@imov/api`) | `apps/api` | `apps/api/vercel.json` | `api.somar.ia.br` (reapontar DNS — antes ia pra VPS) |

A API roda como função serverless: `apps/api/api/index.ts` embrulha o app Fastify existente (`buildApp()` de `src/app.ts`) e injeta a request/response da Vercel direto no servidor HTTP interno do Fastify — as rotas, plugins (cors/jwt/multipart/rate-limit) e lógica de negócio não mudaram. O `vercel.json` da API tem um `rewrite` (`/(.*) → /api`) pra manter as rotas sem prefixo `/api` (ex: `/imoveis`, `/admin/...`) funcionando como antes, e a seção `crons` aciona `/api/cron/gbp-sync` (diário) e `/api/cron/sitemap-submit` (semanal).

**Cuidados conhecidos da API serverless:**
- Plano Hobby da Vercel: Cron Jobs só rodam 1x/dia, sem garantia de minuto exato dentro da hora configurada. Aceitável pros 2 jobs atuais (ambos diários/semanais); não usar Vercel Cron pra algo que precise rodar mais de 1x/dia ou em horário exato — nesse caso, usar um gatilho externo gratuito (ex: cron-job.org) batendo nas mesmas rotas com o header `Authorization: Bearer $CRON_SECRET`.
- `@fastify/rate-limit` usa contador em memória — em serverless cada instância "fria" tem seu próprio contador, então o rate limit não é perfeitamente global entre instâncias (mas continua funcionando, só menos preciso).

### Supabase (Banco + Storage)
- **Banco de dados:** Postgres gerenciado pelo Supabase. `DATABASE_URL` (com pooler/pgbouncer) para runtime, `DIRECT_URL` (sem pooler) só para `prisma migrate`/`db push`.
- **Storage:** bucket `imoveis` já era usado antes da migração (upload de fotos via `SUPABASE_URL`/`SUPABASE_SERVICE_KEY`), sem mudança.

---

## Comandos para retomar o projeto

### ⚠️ Seção antiga (VPS via Termius/PM2) — não usar mais
Os comandos `ssh root@147.79.86.65`, `pm2 status/restart/logs`, `psql -U imov -d imov_db` direto no host etc. eram para a VPS desativada. Não há mais acesso a ela. Para inspecionar o banco hoje, use o Supabase Studio (SQL editor) do projeto ou `pnpm --filter @imov/api exec prisma studio` apontando pro `DATABASE_URL` do Supabase.

### Deploy do frontend e da API (Vercel)

```bash
# Basta fazer push no main — a Vercel builda e deploya os dois projetos
# (frontend com Root Directory apps/web, API com Root Directory apps/api)
git push origin main

# Forçar redeploy sem mudança de código
git commit --allow-empty -m "chore: trigger redeploy" && git push
```

### Banco de dados (Supabase)

```bash
# Aplicar o schema atual no banco do Supabase (sem migration files — usa db push)
pnpm --filter @imov/api exec prisma db push

# Rodar o seed (cria cidades, bairros, 15 imóveis placeholder e o usuário admin)
pnpm --filter @imov/api exec prisma db seed

# Abrir Prisma Studio (UI do banco) apontando pro Supabase
pnpm --filter @imov/api exec prisma studio
```
Esses comandos leem `DATABASE_URL`/`DIRECT_URL` de `apps/api/.env` — preencha com a connection string real do Supabase (Settings → Database) antes de rodar. Nunca commitar esse `.env` (já está no `.gitignore`).

### Rodar localmente

```bash
# 1. Instalar dependências
pnpm install

# 2. Banco local: ou sobe um Postgres via Docker (Docker Desktop precisa estar aberto)...
cd infra && docker compose up -d
# ...ou aponte DATABASE_URL/DIRECT_URL direto para o Supabase do projeto (mais simples)

# 3. Copiar e configurar .env
cp apps/api/.env.example apps/api/.env
# edite apps/api/.env com suas variáveis (DATABASE_URL, DIRECT_URL, CRON_SECRET etc.)

# 4. Rodar migrations + seed
pnpm --filter @imov/api exec prisma migrate dev
pnpm --filter @imov/api exec prisma db seed

# 5. Subir dev
pnpm --filter @imov/web dev       # Frontend: http://localhost:3000
pnpm --filter @imov/api dev       # API: http://localhost:3001

# Prisma Studio (UI do banco)
pnpm --filter @imov/api exec prisma studio

# Build completo
pnpm build
```

### Usuário admin padrão (seed)
- **Email:** `admin@imovimobiliaria.com.br`
- **Senha:** `imov@admin2024`
- **Trocar em produção**

---

## Arquitetura

```
imov-imobiliaria/
├── apps/
│   ├── web/          # Next.js 14 App Router (Vercel)
│   │   └── src/
│   │       ├── app/          # Rotas (App Router)
│   │       │   ├── admin/    # Painel admin (client components)
│   │       │   ├── imoveis/  # Listagem + detalhe
│   │       │   └── lancamentos/
│   │       ├── components/   # Header, admin/ImovelForm
│   │       ├── hooks/        # useLeadBehavior
│   │       └── lib/          # api.ts, admin-api.ts, gtm.ts
│   └── api/          # Fastify REST API (Vercel serverless)
│       ├── api/index.ts       # entrypoint serverless (embrulha o Fastify)
│       ├── prisma/            # schema.prisma + seed.ts (sem migrations/, usa db push)
│       └── src/
│           ├── routes/       # handlers HTTP (inclui cron.ts — jobs via Vercel Cron)
│           │   └── admin/    # rotas protegidas por JWT
│           ├── services/     # rankingService, leadScoringService
│           ├── schemas/      # validação Zod
│           └── utils/        # slug.ts, pagination.ts
├── packages/
│   ├── ui/           # Design system compartilhado
│   ├── types/        # Tipos TypeScript globais (@imov/types)
│   └── config/       # Configs base (Tailwind, ESLint, TSConfig)
└── infra/
    └── docker-compose.yml  # PostgreSQL 15 (dev local opcional — Redis removido, não era usado)
```

---

## Stack e versões

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 14.2.18 | Frontend (App Router) |
| React | 18.3.x | UI |
| Fastify | 4.28.x | API REST |
| Prisma | 5.22.x | ORM + migrations |
| PostgreSQL | 15/16 | Banco de dados (Supabase em produção) |
| Node.js | 20.x | Runtime |
| pnpm | 9.15.9 | Package manager |
| Turborepo | 2.x | Monorepo build |
| TypeScript | 5.6.x | Linguagem (strict mode) |
| Tailwind CSS | 3.4.x | Estilo |
| Zod | 3.23.x | Validação |

---

## Variáveis de ambiente

### API (`apps/api/.env` local / env vars do projeto Vercel da API em produção) — variáveis base
| Variável | Exemplo | Descrição |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres.xxx:senha@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true` | Supabase Postgres, com pooler (runtime) |
| `DIRECT_URL` | `postgresql://postgres.xxx:senha@aws-0-xx.pooler.supabase.com:5432/postgres` | Supabase Postgres, sem pooler (só migrations/`db push`) |
| `JWT_SECRET` | string aleatória longa | Assinar tokens JWT |
| `CORS_ORIGIN` | `https://imov.somar.ia.br,https://imovimobiliaria.vercel.app` | Origens permitidas (comma-separated) |
| `PORT` | `3001` | Porta da API (só usado localmente — Vercel não usa) |
| `HOST` | `0.0.0.0` | Interface de escuta (só usado localmente) |
| `NODE_ENV` | `production` | Ambiente |
| `CRON_SECRET` | string aleatória longa | Autentica chamadas a `/api/cron/*` (Vercel injeta automaticamente como `Authorization: Bearer $CRON_SECRET` nos próprios Cron Jobs) |

### API — integrações Google
| Variável | Como obter | Descrição |
|---|---|---|
| `ADMIN_EMAIL` | `imovimobiliariace@gmail.com` | Email que recebe alertas de leads |
| `GOOGLE_CLIENT_ID` | Google Cloud → APIs & Services → Credentials → OAuth 2.0 Client | Client ID para OAuth |
| `GOOGLE_CLIENT_SECRET` | Mesmo lugar do Client ID | Client Secret (regenerar se exposto) |
| `GOOGLE_REDIRECT_URI` | `https://api.somar.ia.br/google/callback` | URI de redirecionamento OAuth (cadastrar no Google Cloud) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Ver seção "Conta de serviço Google" abaixo | JSON inteiro da conta de serviço, em uma linha (substitui o antigo arquivo em disco) |
| `GOOGLE_SHEETS_ID` | Gerado automaticamente nos logs da função na 1ª execução | ID da planilha "IMOV — Leads" |
| `SMTP_HOST` | `smtp.gmail.com` | Servidor SMTP |
| `SMTP_PORT` | `587` | Porta SMTP (587 = TLS, 465 = SSL) |
| `SMTP_USER` | `imovimobiliariace@gmail.com` | Email remetente |
| `SMTP_PASS` | Ver instruções abaixo | Senha de App do Gmail (16 chars) |
| `GA4_MEASUREMENT_ID` | GA4 → Admin → Streams de dados → ID de medição | Ex: `G-XXXXXXXXXX` |
| `GA4_API_SECRET` | GA4 → Admin → Streams → Measurement Protocol API secrets → Criar | Segredo para Measurement Protocol |

### API — conta de serviço Google (nunca versionar)
- Conta de serviço: `imov-automation@imobiliaria-496802.iam.gserviceaccount.com`
- Projeto GCP: `imobiliaria-496802`
- Antes (VPS): o JSON ficava em `apps/api/secrets/google-service-account.json` no disco e era lido via `GOOGLE_APPLICATION_CREDENTIALS`. **Isso não funciona em serverless** (sem disco persistente).
- Agora: copie o conteúdo inteiro do arquivo `.json` da conta de serviço, cole como uma única linha (sem quebras) na env var `GOOGLE_SERVICE_ACCOUNT_JSON` no painel da Vercel (projeto da API). O código faz `JSON.parse` dela em `apps/api/src/services/googleSheetsService.ts`.
- Se precisar gerar uma chave nova: Google Cloud Console → IAM & Admin → Service Accounts → essa conta → Keys → Add Key → JSON.

### Web (`apps/web` — configurar no Vercel)
| Variável | Valor em produção | Descrição |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.somar.ia.br` | URL da API |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `5585XXXXXXXXX` | WhatsApp (55 + DDD + número) |
| `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` | Google Tag Manager |
| `NEXT_PUBLIC_SITE_URL` | `https://imov.somar.ia.br` | URL pública (SEO) |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Google Search Console → Verificação de propriedade → Tag HTML | Código de verificação do Search Console |

---

## Integrações Google — setup completo

### Credenciais no painel da Vercel (1 vez)

**1. Configurar a conta de serviço como env var**
O arquivo `google-service-account.json` (local, em `apps/api/secrets/`, ignorado pelo git) não pode mais ser lido do disco — a API roda em função serverless. Abra o arquivo, copie o JSON inteiro em uma única linha, e cole no painel da Vercel (projeto da API → Settings → Environment Variables) na variável `GOOGLE_SERVICE_ACCOUNT_JSON`.

**2. Senha de App do Gmail (para SMTP_PASS)**
1. Acesse [myaccount.google.com/security](https://myaccount.google.com/security) com `imovimobiliariace@gmail.com`
2. Verificação em 2 etapas deve estar **ativa** — se não, ative primeiro
3. Acesse [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Clique em "Criar senha de app" → selecione **Outro (nome personalizado)** → nome: `IMOV API`
5. Copie os 16 caracteres gerados (ex: `abcd efgh ijkl mnop`)
6. No VPS: `nano /root/imovimobiliaria/apps/api/.env` → adicione `SMTP_PASS=abcdefghijklmnop` (sem espaços)

**3. GA4 Measurement ID e API Secret**
- **Measurement ID**: [analytics.google.com](https://analytics.google.com) → Admin (engrenagem) → Fluxos de dados → clique no fluxo → campo "ID DE MEDIÇÃO" (começa com `G-`)
- **API Secret**: mesma tela → seção "API Secrets do Measurement Protocol" → "Criar" → copie o valor
- No VPS: adicione `GA4_MEASUREMENT_ID=G-XXXXXXXX` e `GA4_API_SECRET=xxxxx` no `.env`

**4. OAuth Google (Google Meu Negócio + Search Console)**
- No Google Cloud Console → projeto `imobiliaria-496802` → APIs & Services → Credentials → OAuth 2.0 Client → editar
- Authorized redirect URIs → adicionar: `https://api.somar.ia.br/google/callback`
- No VPS: adicione `GOOGLE_CLIENT_ID=xxx` e `GOOGLE_CLIENT_SECRET=xxx` no `.env`
- Acesse `/admin/integracoes` → clique "Conectar com Google" → autorize com `imovimobiliariace@gmail.com`

**5. Reaplicar deploy após configurar todas as variáveis**
Env vars novas/alteradas na Vercel só valem a partir do próximo deploy. No painel do projeto da API: Deployments → ⋯ → Redeploy (ou faça um commit vazio e dê push). Confira os logs da função (Vercel → projeto → Logs) e da execução do Cron Job (Vercel → projeto → Cron Jobs) para validar que `/api/cron/gbp-sync` e `/api/cron/sitemap-submit` estão rodando, e que `GOOGLE_SHEETS_ID` foi gerado na 1ª execução (apareceria no log da função, não mais em `pm2 logs`).

---

## Decisões técnicas

**Monorepo Turborepo + pnpm workspaces**
Permite compartilhar tipos e componentes entre API e frontend sem duplicação. Turborepo faz build paralelo e cacheia resultados — builds são muito mais rápidos.

**Fastify como função serverless na Vercel (migrado de VPS/PM2 em 2026-06-30)**
A VPS foi desativada (perda de acesso) e o projeto migrou para infraestrutura 100% gratuita. Em vez de reescrever cada rota como function handler individual, `apps/api/api/index.ts` embrulha o app Fastify inteiro (`buildApp()`) e injeta a request/response da Vercel no servidor HTTP interno do Fastify — preserva todas as rotas, plugins (cors/jwt/multipart/rate-limit) e lógica de negócio sem reescrita. Trade-offs aceitos: cold start inclui o boot do Fastify; `node-cron` (que dependia de processo sempre ativo) virou rotas HTTP em `/api/cron/*` disparadas por Vercel Cron Jobs; `@fastify/rate-limit` em memória não é mais global entre instâncias serverless (aceitável, não é crítico pro volume atual).

**JWT em Bearer token para o admin cross-domain**
O admin frontend fica em `imov.somar.ia.br` e a API em `api.somar.ia.br`. Cookies httpOnly com `sameSite: lax` não são enviados em requests cross-site fetch/XHR. Solução: login retorna o token no body, admin guarda em localStorage e envia como `Authorization: Bearer`.

**CORS com múltiplas origens por env var**
`CORS_ORIGIN` aceita valores separados por vírgula (`origin1,origin2`). Permite múltiplos domínios sem mudar código — só env var.

**Soft delete para imóveis**
Imóveis nunca são deletados do banco — apenas recebem `status: INATIVO`. Preserva histórico, evita erros de referência em leads e permite recuperação.

**`next.config.mjs` em vez de `.ts`**
Next.js 14 não suporta `next.config.ts` — só a partir do Next.js 15. Mantemos `.mjs` até eventual upgrade.

**`packages/config` com `"type": "module"`**
O `tailwind.config.ts` usa ESM (`export default`). Sem `"type": "module"` no package.json, o Node interpretava como CommonJS e gerava warning de performance. A flag corrige isso.

**`next` no root `package.json`**
O Vercel lê o `package.json` da Root Directory para detectar a versão do Next.js. Como Root Directory = raiz do monorepo (não `apps/web`), o `next` precisa estar no root para a detecção funcionar.

---

## Próximos passos prioritários

### 1. Dados reais
- Substituir campos `[DADO_REAL_A_IMPORTAR]` nos seeds por dados reais
- Cadastrar imóveis reais pelo admin (`/admin/imoveis/novo`)
- Preencher preços médios de bairros (necessário para o ranking funcionar)
- Adicionar fotos reais (campo URL no formulário de imóvel)

### 2. Páginas públicas faltantes (alta prioridade)
- `/bairros` — grid de bairros de Fortaleza
- `/bairros/[slug]` — página de bairro com mapa, estatísticas e listagem de imóveis
- `sitemap.xml` — usar rota `/seo/sitemap-urls` da API (Next.js Route Handler)
- `robots.txt` — bloquear `/admin`, `/api`

### 3. Integração WhatsApp
- Adicionar botão WhatsApp nas páginas de imóvel e detalhe
- Usar `NEXT_PUBLIC_WHATSAPP_NUMBER` já configurado

### 4. Mapa nos imóveis
- Leaflet já está instalado (`leaflet: ^1.9.4`)
- Criar componente `MapaImovel` para página de detalhe
- Criar componente `MapaBairro` para página de bairro

### 5. Upload de fotos
- Implementar upload direto para um bucket (Cloudflare R2 ou S3)
- Admin: substituir campo URL de foto por drag-and-drop de upload

### 6. Lead capture nas páginas
- Formulário "Tenho interesse" na página de detalhe do imóvel
- Formulário na página de bairro
- Usar `useLeadBehavior` hook para capturar comportamento de navegação

### 7. Páginas de conteúdo
- `/blog` e `/blog/[slug]` usando as rotas `/artigos` da API
- Criar primeiros artigos no banco (financiamento, MCMV, dicas)

### 8. Empreendimentos
- `/empreendimentos` e `/empreendimentos/[slug]`
- Admin: formulário de cadastro de empreendimentos

### 9. SEO avançado
- Schema.org `RealEstateListing` nas páginas de imóvel
- Schema.org `Place` nas páginas de bairro
- Schema.org `Article` nos artigos
- `generateMetadata()` nas páginas que ainda não têm

### 10. Melhorias de performance
- Cache: Redis foi removido do stack (nunca chegou a ser usado em código). Se cache server-side for necessário no futuro, considerar `@vercel/kv` (Redis gerenciado, free tier) ou cache HTTP/ISR antes de reintroduzir um Redis dedicado
- `next/image` nas fotos de imóveis (substituir `<img>`)
- ISR (Incremental Static Regeneration) nas páginas de detalhe

---

## Regras absolutas de código

### TypeScript
- **Nunca usar `any`** — sempre tipar corretamente
- **Nunca usar `@ts-ignore`** sem comentário explicando o motivo
- Tipos globais ficam em `packages/types`

### Frontend (Next.js)
- **Server Components por padrão** — usar `'use client'` apenas quando necessário
- Toda nova página pública **precisa de `generateMetadata()`**
- Imagens: **sempre `next/image`** com `width`, `height` e `alt`
- Componentes UI reutilizáveis: **`packages/ui`** — nunca duplicar em `apps/web/components`

### API (Fastify)
- **Toda rota** precisa de validação Zod no input
- Autenticação admin via JWT (cookie OU Bearer token)
- Soft delete em imóveis: **nunca apagar do banco**, usar `status: INATIVO`

### Dados
- **Nunca inventar** dados imobiliários reais (preços, endereços, construtoras)
- Seeds são placeholders marcados com `fonteImportacao: "seed_demo"`
- Construtoras reais de Fortaleza para referência: Victa Engenharia, Tenda, Direcional, Riva, Diagonal, MRV

### Commits
- Padrão conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`

### SEO
- **Nunca indexar:** `/admin`, `/api`, URLs com query params de filtros

---

## Score de Oportunidade

Calculado em `apps/api/src/services/rankingService.ts`:

| Critério | Peso |
|---|---|
| Preço/m² vs média do bairro | 30 |
| Valorização do bairro 12m | 20 |
| Recência do anúncio | 15 |
| Aceita Financiamento/FGTS/MCMV | 15 |
| Completude do anúncio | 10 |
| Infraestrutura do bairro | 10 |

**Aviso obrigatório em toda exibição:** *"Indicadores baseados em estimativas automatizadas. Não constituem avaliação técnica oficial."*
