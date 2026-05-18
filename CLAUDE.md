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

**Infraestrutura**
- VPS Ubuntu 24.04 com API rodando via PM2
- PostgreSQL + Redis instalados no host do VPS
- Nginx Proxy Manager (Docker) gerenciando SSL e reverse proxy
- Domínio `api.somar.ia.br` → VPS com SSL Let's Encrypt
- Domínio `imov.somar.ia.br` → Vercel com SSL automático
- Deploy automático: push no `main` → Vercel builda e deploya

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

**Integrações pendentes**
- WhatsApp click-to-chat nos imóveis (`NEXT_PUBLIC_WHATSAPP_NUMBER`)
- Google Tag Manager (`NEXT_PUBLIC_GTM_ID`)
- Mapa Leaflet nas páginas de imóvel e bairro (componente instalado, não usado)
- SEO: Schema.org `RealEstateListing`, `Place`, `Article`

---

## Infraestrutura

### VPS
- **IP:** `147.79.86.65`
- **OS:** Ubuntu 24.04.4 LTS
- **Acesso:** Termius ou qualquer cliente SSH
  ```bash
  ssh root@147.79.86.65
  # senha: [guardada no Termius]
  ```

### Serviços no VPS
| Serviço | Onde roda | Porta | Gerenciador |
|---|---|---|---|
| API Fastify | Host (PM2) | 3001 | PM2 |
| PostgreSQL | Host | 5432 | systemd |
| Redis | Host | 6379 | systemd |
| Nginx Proxy Manager | Docker | 80, 443, 81 | Docker |
| n8n | Docker | 5678 | Docker |
| Evolution API | Docker | 8080 | Docker |

### Domínios
| Domínio | Aponta para | Uso |
|---|---|---|
| `imov.somar.ia.br` | Vercel (CNAME) | Frontend |
| `api.somar.ia.br` | VPS (A record) | API |

### Banco de dados de produção
- **Host:** `localhost:5432`
- **Database:** `imov_db`
- **User:** `imov`
- **Senha:** guardada em `/root/imovimobiliaria/apps/api/.env`

### Admin do Nginx Proxy Manager
- URL: `http://147.79.86.65:81`
- Gerencia SSL e reverse proxy para `api.somar.ia.br → localhost:3001`

---

## Comandos para retomar o projeto

### No VPS (via Termius)

```bash
# Ver status da API
pm2 status

# Logs em tempo real
pm2 logs imov-api

# Logs de erros apenas
pm2 logs imov-api --err

# Reiniciar API após mudanças
pm2 restart imov-api

# Atualizar código do VPS após push
cd /root/imovimobiliaria && git pull origin main

# Rebuild e restart da API
cd /root/imovimobiliaria && pnpm --filter @imov/api build && pm2 restart imov-api

# Ver .env da API
cat /root/imovimobiliaria/apps/api/.env

# Abrir banco de dados (prompt psql)
psql -U imov -d imov_db

# Rodar seeds novamente (cuidado em produção)
cd /root/imovimobiliaria && pnpm --filter @imov/api exec prisma db seed

# Rodar migrations em produção
cd /root/imovimobiliaria && pnpm --filter @imov/api exec prisma migrate deploy
```

### Deploy do frontend

```bash
# Basta fazer push no main — Vercel deploya automaticamente
git push origin main

# Forçar redeploy sem mudança de código
git commit --allow-empty -m "chore: trigger redeploy" && git push
```

### Deploy da API (após mudanças no código)

```bash
# Local: push para o GitHub
git push origin main

# No VPS: pull + build + restart
cd /root/imovimobiliaria
git pull origin main
pnpm --filter @imov/api build
pm2 restart imov-api
```

### Rodar localmente

```bash
# 1. Instalar dependências
pnpm install

# 2. Subir banco + redis (Docker Desktop precisa estar aberto)
cd infra && docker compose up -d

# 3. Copiar e configurar .env
cp apps/api/.env.example apps/api/.env
# edite apps/api/.env com suas variáveis

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
│   └── api/          # Fastify REST API (VPS/PM2)
│       ├── prisma/           # schema.prisma + seed.ts + migrations/
│       └── src/
│           ├── routes/       # handlers HTTP
│           │   └── admin/    # rotas protegidas por JWT
│           ├── services/     # rankingService, leadScoringService
│           ├── schemas/      # validação Zod
│           └── utils/        # slug.ts, pagination.ts
├── packages/
│   ├── ui/           # Design system compartilhado
│   ├── types/        # Tipos TypeScript globais (@imov/types)
│   └── config/       # Configs base (Tailwind, ESLint, TSConfig)
└── infra/
    └── docker-compose.yml  # PostgreSQL 15 + Redis 7 (dev local)
```

---

## Stack e versões

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 14.2.18 | Frontend (App Router) |
| React | 18.3.x | UI |
| Fastify | 4.28.x | API REST |
| Prisma | 5.22.x | ORM + migrations |
| PostgreSQL | 15/16 | Banco de dados |
| Redis | 7 | Cache (instalado, não usado ainda no código) |
| Node.js | 20.x | Runtime |
| pnpm | 9.15.9 | Package manager |
| Turborepo | 2.x | Monorepo build |
| TypeScript | 5.6.x | Linguagem (strict mode) |
| Tailwind CSS | 3.4.x | Estilo |
| Zod | 3.23.x | Validação |

---

## Variáveis de ambiente

### API (`apps/api/.env`)
| Variável | Exemplo | Descrição |
|---|---|---|
| `DATABASE_URL` | `postgresql://imov:senha@localhost:5432/imov_db` | PostgreSQL |
| `REDIS_URL` | `redis://localhost:6379` | Redis |
| `JWT_SECRET` | string aleatória longa | Assinar tokens JWT |
| `CORS_ORIGIN` | `https://imov.somar.ia.br,https://imovimobiliaria.vercel.app` | Origens permitidas (comma-separated) |
| `PORT` | `3001` | Porta da API |
| `HOST` | `0.0.0.0` | Interface de escuta |
| `NODE_ENV` | `production` | Ambiente |

### Web (`apps/web` — configurar no Vercel)
| Variável | Valor em produção | Descrição |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.somar.ia.br` | URL da API |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `5585XXXXXXXXX` | WhatsApp (55 + DDD + número) |
| `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` | Google Tag Manager |
| `NEXT_PUBLIC_SITE_URL` | `https://imov.somar.ia.br` | URL pública (SEO) |

---

## Decisões técnicas

**Monorepo Turborepo + pnpm workspaces**
Permite compartilhar tipos e componentes entre API e frontend sem duplicação. Turborepo faz build paralelo e cacheia resultados — builds são muito mais rápidos.

**Fastify no VPS, não no Vercel**
Fastify é um servidor Node.js de longa duração — precisa estar sempre ativo para manter conexão com PostgreSQL e Redis. Vercel é serverless (mata o processo após cada request), incompatível com Fastify diretamente. VPS garante controle total e custos previsíveis.

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
- Ativar cache Redis nas rotas mais acessadas (`/imoveis`, `/bairros`)
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
