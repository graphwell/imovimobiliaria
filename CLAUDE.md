# IMOV Imobiliária — Contexto do Projeto

## Sobre o Projeto
Plataforma de inteligência imobiliária regional focada em Fortaleza/CE e região metropolitana.
Monorepo Turborepo com pnpm workspaces.

Posicionamento: portal de busca + inteligência de mercado + plataforma educacional + sistema consultivo.

**Referências:** QuintoAndar/Loft (UX), FipeZap (dados), Viva Real/Zap (listagens), Notion/Linear/Vercel (design SaaS).

---

## Comandos Essenciais

```bash
# Instalar dependências
pnpm install

# Subir banco + redis (Docker Desktop deve estar aberto)
cd infra && docker compose up -d

# Dev frontend (porta 3000)
pnpm --filter @imov/web dev

# Dev API (porta 3001)
pnpm --filter @imov/api dev

# Migrations Prisma
pnpm --filter @imov/api exec prisma migrate dev

# Seeds (após migrations)
pnpm --filter @imov/api exec prisma db seed

# Gerar Prisma client
pnpm --filter @imov/api exec prisma generate

# Build completo
pnpm build

# Prisma Studio (UI do banco)
pnpm --filter @imov/api exec prisma studio
```

---

## Arquitetura

```
imov-imobiliaria/
├── apps/
│   ├── web/          # Next.js 14 App Router (porta 3000)
│   │   └── src/
│   │       ├── app/          # Rotas (App Router)
│   │       ├── components/   # Componentes específicos do app
│   │       ├── hooks/        # React hooks (useLeadBehavior, etc.)
│   │       └── lib/          # api.ts, gtm.ts
│   └── api/          # Fastify REST API (porta 3001)
│       ├── prisma/           # schema.prisma + seed.ts + migrations/
│       └── src/
│           ├── routes/       # Handlers HTTP por domínio
│           │   └── admin/    # Rotas protegidas por JWT
│           ├── services/     # Lógica de negócio (rankingService, leadScoring)
│           ├── schemas/      # Schemas Zod de validação
│           └── utils/        # slug.ts, pagination.ts
├── packages/
│   ├── ui/           # Design system React compartilhado
│   ├── types/        # Tipos TypeScript globais (@imov/types)
│   └── config/       # Configs base (Tailwind, ESLint, TSConfig)
└── infra/
    └── docker-compose.yml  # PostgreSQL 15 + Redis 7
```

---

## Stack e Versões

- **Next.js:** 14.2.x (App Router)
- **React:** 18.3.x
- **Fastify:** 4.28.x
- **Prisma:** 5.22.x (PostgreSQL)
- **Node.js:** 20.x
- **pnpm:** 9.x
- **Turborepo:** 2.x
- **TypeScript:** 5.6.x (strict mode)
- **Tailwind CSS:** 3.4.x
- **Zod:** 3.23.x

---

## Variáveis de Ambiente

Copie `.env.example` para `.env` e ajuste os valores.

| Variável | Onde usar | Descrição |
|---|---|---|
| `DATABASE_URL` | API | Connection string PostgreSQL |
| `REDIS_URL` | API | URL do Redis |
| `JWT_SECRET` | API | Chave para assinar tokens JWT |
| `PORT` | API | Porta da API (default: 3001) |
| `CORS_ORIGIN` | API | URL permitida pelo CORS |
| `NEXT_PUBLIC_API_URL` | Web | URL base da API |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Web | Número do WhatsApp (55 + DDD + número) |
| `NEXT_PUBLIC_GTM_ID` | Web | ID do Google Tag Manager |
| `NEXT_PUBLIC_SITE_URL` | Web | URL pública do site (para SEO) |

---

## Regras Absolutas de Código

### TypeScript
- **Nunca usar `any`** — sempre tipar corretamente
- **Nunca usar `@ts-ignore`** sem comentário explicando o motivo
- Tipos globais ficam em `packages/types`

### Frontend (Next.js)
- **Server Components por padrão** — usar `'use client'` apenas quando necessário (hooks, eventos, estado)
- Toda nova página pública **precisa de `generateMetadata()`** com `title` e `description` únicos
- Imagens: **sempre `next/image`** com `width`, `height` e `alt` descritivo
- Componentes UI reutilizáveis: **`packages/ui`** — nunca duplicar em `apps/web/components`

### API (Fastify)
- **Toda rota** precisa de validação Zod no input
- Autenticação admin via JWT em cookie httpOnly
- Soft delete em imóveis: nunca apagar do banco, usar `status: INATIVO`

### Slugs
- Sempre em minúsculas com hífens, sem acentos
- Gerado automaticamente via `slugify()` em `src/utils/slug.ts`

### Commits
- Padrão conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`

---

## Dados e Conteúdo

- **Nunca inventar** empreendimentos, construtoras, valores ou dados imobiliários reais
- Seeds são placeholders marcados com `fonteImportacao: "seed_demo"`
- Campos com `[DADO_REAL_A_IMPORTAR]` precisam de dados reais antes do deploy
- Construtoras de referência (mercado real Fortaleza): Victa Engenharia, Tenda, Direcional, Riva, Diagonal, MRV

---

## SEO — Regras Obrigatórias

- Toda página pública: `generateMetadata()` com `title` e `description` únicos
- Imóveis: Schema.org `RealEstateListing`
- Bairros: Schema.org `Place`
- Artigos: Schema.org `Article`
- **Nunca indexar:** `/admin`, `/api`, URLs com query params de filtros
- Sitemap em `/sitemap.xml`, robots em `/robots.txt`

---

## Sistema de Score de Oportunidade

Calculado em `apps/api/src/services/rankingService.ts`:

| Critério | Peso |
|---|---|
| Preço/m² vs média do bairro | 30 |
| Valorização do bairro 12m | 20 |
| Recência do anúncio | 15 |
| Aceita Financiamento/FGTS/MCMV | 15 |
| Completude do anúncio | 10 |
| Infraestrutura do bairro | 10 |

**Aviso obrigatório em toda exibição:** "Indicadores baseados em estimativas automatizadas. Não constituem avaliação técnica oficial."

---

## O Que Nunca Fazer

- Nunca editar `packages/config` sem rodar lint em todos os apps
- Nunca usar Client Components desnecessariamente
- Nunca expor `/admin` no sitemap
- Nunca commitar `.env` — apenas `.env.example` com descrições
- Nunca apagar imóvel do banco — usar `status: INATIVO`
- Nunca hardcodar textos, valores ou dados — tudo via props ou env vars
- Nunca inventar dados de mercado imobiliário

---

## Usuário Admin Padrão (seed)

- Email: `admin@imovimobiliaria.com.br`
- Senha: `imov@admin2024`
- **Trocar em produção**
