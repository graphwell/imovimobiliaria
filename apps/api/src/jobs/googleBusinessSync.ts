import type { PrismaClient } from '@prisma/client'
import { getLocations, getAccounts, createPost } from '../services/googleBusinessService.js'

function fmtCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

export async function syncImovelToGBP(
  prisma: PrismaClient,
  imovelId: string,
): Promise<{ posted: boolean; locationName?: string; error?: string }> {
  try {
    const imovel = await prisma.imovel.findUnique({
      where: { id: imovelId },
      include: { bairro: { select: { nome: true } } },
    })

    if (!imovel || imovel.status !== 'DISPONIVEL') {
      return { posted: false, error: 'Imóvel não encontrado ou não disponível' }
    }

    const accounts = await getAccounts(prisma)
    if (accounts.length === 0) return { posted: false, error: 'Nenhuma conta Google Meu Negócio encontrada' }

    const locations = await getLocations(prisma, accounts[0]!.name)
    if (locations.length === 0) return { posted: false, error: 'Nenhum estabelecimento encontrado' }

    const location = locations[0]!
    const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://imov.somar.ia.br'
    const tipoLabel: Record<string, string> = {
      APARTAMENTO: 'Apartamento', CASA: 'Casa', TERRENO: 'Terreno',
      COBERTURA: 'Cobertura', COMERCIAL: 'Comercial', KITNET: 'Kitnet',
    }

    const tipo = tipoLabel[imovel.tipo] ?? imovel.tipo
    const quartos = imovel.quartos > 0 ? ` com ${imovel.quartos} quarto${imovel.quartos > 1 ? 's' : ''}` : ''
    const preco = fmtCurrency(Number(imovel.preco))

    const summary =
      `🏠 ${tipo}${quartos} no ${imovel.bairro.nome} — ${preco}\n\n` +
      `${imovel.descricao ? imovel.descricao.slice(0, 200) : imovel.titulo}\n\n` +
      `✅ Acesse o link e veja mais detalhes, fotos e opções de financiamento.`

    await createPost(prisma, location.name, {
      summary,
      callToActionType: 'LEARN_MORE',
      callToActionUrl: `${siteUrl}/imoveis/${imovel.slug}`,
    })

    return { posted: true, locationName: location.name }
  } catch (err) {
    return { posted: false, error: String(err) }
  }
}

export async function syncImoveisRecentes(prisma: PrismaClient): Promise<void> {
  const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const imoveisNovos = await prisma.imovel.findMany({
    where: {
      status: 'DISPONIVEL',
      createdAt: { gte: ontem },
    },
    select: { id: true, titulo: true },
    take: 3,
  })

  for (const imovel of imoveisNovos) {
    const result = await syncImovelToGBP(prisma, imovel.id)
    if (result.posted) {
      console.log(`[GBP Sync] Post criado para imóvel: ${imovel.titulo}`)
    } else {
      console.warn(`[GBP Sync] Falha ao postar ${imovel.titulo}: ${result.error}`)
    }
  }
}
