import type { Metadata } from 'next'
import { CalculadoraConsorcio } from '../../../components/simulador/CalculadoraConsorcio'

export const metadata: Metadata = {
  title: 'Calculadora de Consórcio Imobiliário — Lance Embutido + Próprio | IMOV',
  description:
    'Simule seu consórcio imobiliário com lance embutido e lance próprio. Embracon, Porto Seguro, Caixa e mais. Calcule sua estimativa de contemplação. IMOV Fortaleza.',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'O que é consórcio imobiliário?',
      acceptedAnswer: { '@type': 'Answer', text: 'Consórcio imobiliário é uma modalidade de compra coletiva onde um grupo de pessoas contribui mensalmente para formar um fundo comum. Periodicamente, um ou mais participantes são contemplados por sorteio ou lance e recebem uma carta de crédito para adquirir o imóvel. Não há juros, apenas taxa de administração.' },
    },
    {
      '@type': 'Question',
      name: 'O que é lance embutido no consórcio?',
      acceptedAnswer: { '@type': 'Answer', text: 'O lance embutido é uma modalidade onde o consorciado utiliza parte do próprio crédito como lance. Ao ser contemplado, recebe o crédito total menos o percentual embutido. Permite participar com lance mesmo sem dinheiro disponível.' },
    },
    {
      '@type': 'Question',
      name: 'Qual a diferença entre consórcio e financiamento imobiliário?',
      acceptedAnswer: { '@type': 'Answer', text: 'O financiamento libera o crédito imediatamente mas cobra juros (SELIC + spread). O consórcio não tem juros (só taxa de adm. de 15–20% diluída), mas exige contemplação por sorteio ou lance. O consórcio é até 40% mais barato no total pago, mas sem prazo garantido para contemplação.' },
    },
    {
      '@type': 'Question',
      name: 'Posso usar FGTS no consórcio imobiliário?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sim. O FGTS pode ser usado como lance para antecipar a contemplação ou para reduzir o saldo devedor após ser contemplado, desde que o imóvel seja residencial, esteja localizado na cidade onde o consorciado trabalha ou mora há mais de 1 ano, e o valor esteja dentro dos limites do FGTS.' },
    },
  ],
}

export default function SimuladorConsorcioPage() {
  const whatsapp = process.env['NEXT_PUBLIC_WHATSAPP_NUMBER'] ?? '5585999999999'
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? ''
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <CalculadoraConsorcio whatsapp={whatsapp} apiUrl={apiUrl} />
    </>
  )
}
