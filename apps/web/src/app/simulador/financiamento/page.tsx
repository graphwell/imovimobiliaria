import type { Metadata } from 'next'
import { SimuladorFinanciamento } from '../../../components/simulador/SimuladorFinanciamento'

export const metadata: Metadata = {
  title: 'Simulador de Financiamento Imobiliário | IMOV Fortaleza',
  description:
    'Simule seu financiamento imobiliário pela tabela Price. Calcule parcelas, juros totais e compare com consórcio. IMOV Fortaleza.',
}

export default function SimuladorFinanciamentoPage() {
  const whatsapp = process.env['NEXT_PUBLIC_WHATSAPP_NUMBER'] ?? '5585999999999'
  return <SimuladorFinanciamento whatsapp={whatsapp} />
}
