import type { Metadata } from 'next'
import { CalculadoraConsorcio } from '../../../components/simulador/CalculadoraConsorcio'

export const metadata: Metadata = {
  title: 'Calculadora de Consórcio Imobiliário — Lance Embutido + Próprio | IMOV',
  description:
    'Simule seu consórcio imobiliário com lance embutido e lance próprio. Embracon, Porto Seguro, Caixa e mais. Calcule sua estimativa de contemplação. IMOV Fortaleza.',
}

export default function SimuladorConsorcioPage() {
  const whatsapp = process.env['NEXT_PUBLIC_WHATSAPP_NUMBER'] ?? '5585999999999'
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? ''
  return <CalculadoraConsorcio whatsapp={whatsapp} apiUrl={apiUrl} />
}
