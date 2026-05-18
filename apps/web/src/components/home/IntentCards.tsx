'use client'

import { useRouter } from 'next/navigation'

const INTENCOES = [
  {
    id: 'comprar',
    emoji: '🏠',
    titulo: 'Quero comprar um imóvel',
    descricao: 'Encontre o imóvel certo pelo melhor preço',
    url: '/imoveis?modalidade=VENDA',
    cor: 'from-blue-500/20 to-brand-500/20 hover:from-blue-500/30 hover:to-brand-500/30 border-blue-500/30 hover:border-blue-400/50',
    mensagemWpp: 'Olá! Estou buscando um imóvel para comprar em Fortaleza e gostaria de ajuda.',
  },
  {
    id: 'investir',
    emoji: '📈',
    titulo: 'Quero investir em imóveis',
    descricao: 'Oportunidades com melhor retorno e valorização',
    url: '/imoveis?oportunidade=true&ordenar=ranking',
    cor: 'from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border-emerald-500/30 hover:border-emerald-400/50',
    mensagemWpp: 'Olá! Tenho interesse em investir em imóveis em Fortaleza. Podem me indicar as melhores oportunidades?',
  },
  {
    id: 'financiar',
    emoji: '🏦',
    titulo: 'Quero financiar pelo banco',
    descricao: 'Imóveis com aprovação de crédito facilitada',
    url: '/imoveis?aceitaFinanciamento=true',
    cor: 'from-violet-500/20 to-purple-500/20 hover:from-violet-500/30 hover:to-purple-500/30 border-violet-500/30 hover:border-violet-400/50',
    mensagemWpp: 'Olá! Quero financiar um imóvel e preciso de orientação sobre as melhores opções em Fortaleza.',
  },
  {
    id: 'mcmv',
    emoji: '🟢',
    titulo: 'Minha Casa Minha Vida',
    descricao: 'Imóveis elegíveis com condições especiais',
    url: '/imoveis?elegivelMcmv=true',
    cor: 'from-green-500/20 to-lime-500/20 hover:from-green-500/30 hover:to-lime-500/30 border-green-500/30 hover:border-green-400/50',
    mensagemWpp: 'Olá! Quero saber mais sobre imóveis elegíveis para o Minha Casa Minha Vida em Fortaleza.',
  },
]

export function IntentCards() {
  const router = useRouter()

  function handleClick(intencao: typeof INTENCOES[0]) {
    sessionStorage.setItem('imov_intencao', intencao.id)
    sessionStorage.setItem('imov_wpp_msg', intencao.mensagemWpp)
    router.push(intencao.url)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-4xl mx-auto mt-8">
      {INTENCOES.map(intencao => (
        <button
          key={intencao.id}
          onClick={() => handleClick(intencao)}
          className={`group flex flex-col items-center text-center p-4 md:p-5 rounded-2xl border bg-gradient-to-br backdrop-blur-sm transition-all duration-200 cursor-pointer ${intencao.cor}`}
        >
          <span className="text-3xl md:text-4xl mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-200">
            {intencao.emoji}
          </span>
          <p className="text-white font-semibold text-sm md:text-base leading-tight">
            {intencao.titulo}
          </p>
          <p className="text-white/60 text-xs mt-1 hidden md:block leading-tight">
            {intencao.descricao}
          </p>
        </button>
      ))}
    </div>
  )
}
