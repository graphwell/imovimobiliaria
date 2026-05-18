import Link from 'next/link'
import { ImovelForm } from '../../../../components/admin/ImovelForm'

export default function NovoImovelPage() {
  return (
    <div>
      <div className="max-w-4xl mx-auto mb-6">
        <Link href="/admin/imoveis" className="text-sm text-brand-500 hover:underline">← Voltar</Link>
        <h1 className="text-xl font-bold text-neutral-900 mt-2">Novo Imóvel</h1>
      </div>
      <ImovelForm />
    </div>
  )
}
