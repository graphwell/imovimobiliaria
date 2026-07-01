// DESCONTINUADO: esta tela chamava um serviço externo (pipeline-api.somar.ia.br)
// que rodava na VPS antiga e foi perdido junto com ela — o código desse
// backend não existe neste repositório. Para não fazer fetch para uma URL
// morta, a tela foi reduzida a este aviso estático.
// TODO: repensar o pipeline de importação de mídia (Google Drive → fotos de
// imóveis) do zero, como Edge Function ou serviço separado, antes de reativar
// esta página. Os componentes antigos (NovaImportacaoModal.tsx, lib/pipeline-api.ts)
// ficam como referência de UI, mas não devem ser chamados.

export default function ImportacoesPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
        <div className="text-3xl mb-3">🚧</div>
        <h1 className="text-lg font-bold text-neutral-900 mb-2">Importações desativadas</h1>
        <p className="text-sm text-neutral-500">
          Essa funcionalidade dependia de um serviço que rodava na VPS antiga e foi
          descontinuado na migração para Vercel + Supabase. Para cadastrar fotos de
          imóveis, use o upload em{' '}
          <span className="font-medium text-neutral-700">Imóveis → Novo/Editar</span>.
        </p>
      </div>
    </div>
  )
}
