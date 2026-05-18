import type { Metadata } from 'next'
import { SimuladorComparador } from '../../../components/comparador/SimuladorComparador'

export const metadata: Metadata = {
  title: 'Consórcio ou Financiamento? Simulador + Consultoria | IMOV Fortaleza',
  description:
    'Simule e compare consórcio x financiamento imobiliário. Descubra como ser contemplado em 6 a 18 meses com estratégia de lance. Consultoria IMOV Fortaleza.',
}

export default function ComparadorPage() {
  const whatsapp = process.env['NEXT_PUBLIC_WHATSAPP_NUMBER'] ?? '5585999999999'
  return <SimuladorComparador whatsapp={whatsapp} />
}
