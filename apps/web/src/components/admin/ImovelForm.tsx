'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '../../lib/admin-api'

interface Bairro { id: string; nome: string; cidadeId: string; cidade: { id: string; nome: string } }

interface ImovelFormProps {
  initialData?: Record<string, unknown>
  imovelId?: string
}

type Foto = { url: string; legenda?: string; ordem: number; tipo: string }

const TIPOS = ['APARTAMENTO','CASA','TERRENO','COBERTURA','COMERCIAL','KITNET']
const MODALIDADES = ['VENDA','LOCACAO','LANCAMENTO']
const STATUS_OPTS = ['DISPONIVEL','VENDIDO','ALUGADO','RESERVADO','INATIVO']

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">
        {label}{required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
const checkCls = "h-4 w-4 rounded text-brand-500 border-neutral-300 focus:ring-brand-500"

export function ImovelForm({ initialData, imovelId }: ImovelFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [bairros, setBairros] = useState<Bairro[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [diferencialInput, setDiferencialInput] = useState('')
  const [uploadingCount, setUploadingCount] = useState(0)
  const [uploadErro, setUploadErro] = useState('')
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const [form, setForm] = useState({
    titulo: '', descricao: '', tipo: 'APARTAMENTO', modalidade: 'VENDA', status: 'DISPONIVEL',
    preco: '', areaTotal: '', areaPrivativa: '', quartos: '0', suites: '0', banheiros: '1', vagas: '0',
    andarPavimento: '', totalAndares: '', anoConstrucao: '',
    precoCondominio: '', precoIptu: '',
    aceitaFinanciamento: true, aceitaFgts: false, aceitaConsorcio: false, elegivelMcmv: false,
    novo: false, destaque: false, oportunidade: false,
    endereco: '', numero: 'S/N', complemento: '', cep: '',
    bairroId: '', cidadeId: '',
    construtoraNome: '', latitude: '', longitude: '',
    diferenciais: [] as string[],
    fotos: [] as { url: string; legenda?: string; ordem: number; tipo: string }[],
    metaTitle: '', metaDescription: '',
    ...initialData,
  })

  useEffect(() => {
    adminApi.bairros().then(res => {
      setBairros(res.data)
      if (!form.bairroId && res.data.length > 0) {
        setForm(f => ({ ...f, bairroId: res.data[0].id, cidadeId: res.data[0].cidadeId }))
      }
    })
  }, [])

  function handleBairro(bairroId: string) {
    const b = bairros.find(b => b.id === bairroId)
    if (b) setForm(f => ({ ...f, bairroId: b.id, cidadeId: b.cidadeId }))
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadErro('')
    setUploadingCount(files.length)
    try {
      const results = await Promise.all(files.map(file => adminApi.uploadImagem(file)))
      setForm(f => {
        const existing = f.fotos as Foto[]
        const novas = results.map((r, i) => ({
          url: r.url,
          ordem: existing.length + i,
          tipo: existing.length + i === 0 ? 'capa' : 'interior',
        }))
        return { ...f, fotos: [...existing, ...novas] }
      })
    } catch (err) {
      setUploadErro(err instanceof Error ? err.message : 'Erro no upload')
    } finally {
      setUploadingCount(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeFoto(url: string) {
    setForm(f => {
      const fotos = (f.fotos as Foto[]).filter(x => x.url !== url).map((x, i) => ({ ...x, ordem: i, tipo: i === 0 ? 'capa' : x.tipo === 'capa' ? 'interior' : x.tipo }))
      return { ...f, fotos }
    })
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault()
    setDragOverIndex(null)
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (isNaN(dragIndex) || dragIndex === dropIndex) return
    setForm(f => {
      const fotos = [...(f.fotos as Foto[])]
      const [dragged] = fotos.splice(dragIndex, 1)
      fotos.splice(dropIndex, 0, dragged!)
      const reordered = fotos.map((x, i) => ({ ...x, ordem: i, tipo: i === 0 ? 'capa' : x.tipo === 'capa' ? 'interior' : x.tipo }))
      return { ...f, fotos: reordered }
    })
  }

  function addDiferencial() {
    const d = diferencialInput.trim()
    if (!d || (form.diferenciais as string[]).includes(d)) return
    setForm(f => ({ ...f, diferenciais: [...(f.diferenciais as string[]), d] }))
    setDiferencialInput('')
  }

  function removeDiferencial(d: string) {
    setForm(f => ({ ...f, diferenciais: (f.diferenciais as string[]).filter(x => x !== d) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const payload = {
        titulo: form.titulo, descricao: form.descricao,
        tipo: form.tipo, modalidade: form.modalidade, status: form.status,
        preco: Number(form.preco), areaTotal: Number(form.areaTotal),
        ...(form.areaPrivativa ? { areaPrivativa: Number(form.areaPrivativa) } : {}),
        quartos: Number(form.quartos), suites: Number(form.suites),
        banheiros: Number(form.banheiros), vagas: Number(form.vagas),
        ...(form.andarPavimento ? { andarPavimento: Number(form.andarPavimento) } : {}),
        ...(form.totalAndares ? { totalAndares: Number(form.totalAndares) } : {}),
        ...(form.anoConstrucao ? { anoConstrucao: Number(form.anoConstrucao) } : {}),
        ...(form.precoCondominio ? { precoCondominio: Number(form.precoCondominio) } : {}),
        ...(form.precoIptu ? { precoIptu: Number(form.precoIptu) } : {}),
        aceitaFinanciamento: form.aceitaFinanciamento, aceitaFgts: form.aceitaFgts,
        aceitaConsorcio: form.aceitaConsorcio, elegivelMcmv: form.elegivelMcmv,
        novo: form.novo, destaque: form.destaque, oportunidade: form.oportunidade,
        endereco: form.endereco, numero: form.numero,
        ...(form.complemento ? { complemento: form.complemento } : {}),
        ...(form.cep ? { cep: form.cep } : {}),
        bairroId: form.bairroId, cidadeId: form.cidadeId,
        ...(form.construtoraNome ? { construtoraNome: form.construtoraNome } : {}),
        ...(form.latitude ? { latitude: Number(form.latitude) } : {}),
        ...(form.longitude ? { longitude: Number(form.longitude) } : {}),
        diferenciais: form.diferenciais,
        fotos: form.fotos,
        ...(form.metaTitle ? { metaTitle: form.metaTitle } : {}),
        ...(form.metaDescription ? { metaDescription: form.metaDescription } : {}),
      }

      if (imovelId) {
        await adminApi.imoveis.update(imovelId, payload)
      } else {
        await adminApi.imoveis.create(payload)
      }
      router.push('/admin/imoveis')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))
  const setCheck = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.checked }))

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {erro && <div className="mb-4 p-3 bg-danger-50 text-danger-600 text-sm rounded-lg">{erro}</div>}

      <div className="grid grid-cols-1 gap-6">

        {/* Informações básicas */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="font-semibold text-neutral-900 mb-4">Informações básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label="Título" required>
                <input value={form.titulo as string} onChange={set('titulo')} className={inputCls} placeholder="Ex: Apartamento 2 Quartos no Meireles" required />
              </Field>
            </div>
            <Field label="Tipo" required>
              <select value={form.tipo as string} onChange={set('tipo')} className={inputCls}>
                {TIPOS.map(t => <option key={t} value={t}>{t.charAt(0)+t.slice(1).toLowerCase()}</option>)}
              </select>
            </Field>
            <Field label="Modalidade" required>
              <select value={form.modalidade as string} onChange={set('modalidade')} className={inputCls}>
                {MODALIDADES.map(m => <option key={m} value={m}>{m.charAt(0)+m.slice(1).toLowerCase()}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status as string} onChange={set('status')} className={inputCls}>
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0)+s.slice(1).toLowerCase()}</option>)}
              </select>
            </Field>
            <Field label="Construtora">
              <input value={form.construtoraNome as string} onChange={set('construtoraNome')} className={inputCls} placeholder="Nome da construtora" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Descrição">
                <textarea value={form.descricao as string} onChange={set('descricao')} className={inputCls} rows={4} placeholder="Descreva o imóvel..." />
              </Field>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="font-semibold text-neutral-900 mb-4">Valores</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Preço (R$)" required>
              <input type="number" value={form.preco as string} onChange={set('preco')} className={inputCls} placeholder="0" required min={0} />
            </Field>
            <Field label="Condomínio (R$)">
              <input type="number" value={form.precoCondominio as string} onChange={set('precoCondominio')} className={inputCls} placeholder="0" min={0} />
            </Field>
            <Field label="IPTU anual (R$)">
              <input type="number" value={form.precoIptu as string} onChange={set('precoIptu')} className={inputCls} placeholder="0" min={0} />
            </Field>
          </div>
        </div>

        {/* Características */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="font-semibold text-neutral-900 mb-4">Características</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Área total (m²)" required>
              <input type="number" value={form.areaTotal as string} onChange={set('areaTotal')} className={inputCls} placeholder="0" required min={0} />
            </Field>
            <Field label="Área privativa (m²)">
              <input type="number" value={form.areaPrivativa as string} onChange={set('areaPrivativa')} className={inputCls} placeholder="0" min={0} />
            </Field>
            <Field label="Quartos">
              <input type="number" value={form.quartos as string} onChange={set('quartos')} className={inputCls} min={0} />
            </Field>
            <Field label="Suítes">
              <input type="number" value={form.suites as string} onChange={set('suites')} className={inputCls} min={0} />
            </Field>
            <Field label="Banheiros">
              <input type="number" value={form.banheiros as string} onChange={set('banheiros')} className={inputCls} min={0} />
            </Field>
            <Field label="Vagas">
              <input type="number" value={form.vagas as string} onChange={set('vagas')} className={inputCls} min={0} />
            </Field>
            <Field label="Andar">
              <input type="number" value={form.andarPavimento as string} onChange={set('andarPavimento')} className={inputCls} placeholder="—" min={0} />
            </Field>
            <Field label="Total andares">
              <input type="number" value={form.totalAndares as string} onChange={set('totalAndares')} className={inputCls} placeholder="—" min={0} />
            </Field>
            <Field label="Ano construção">
              <input type="number" value={form.anoConstrucao as string} onChange={set('anoConstrucao')} className={inputCls} placeholder="2024" min={1900} max={2030} />
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { k: 'aceitaFinanciamento', l: 'Aceita financiamento' },
              { k: 'aceitaFgts', l: 'Aceita FGTS' },
              { k: 'aceitaConsorcio', l: 'Aceita consórcio' },
              { k: 'elegivelMcmv', l: 'Elegível MCMV' },
              { k: 'novo', l: 'Novo / lançamento' },
              { k: 'destaque', l: 'Destaque' },
              { k: 'oportunidade', l: 'Oportunidade' },
            ].map(({ k, l }) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[k as keyof typeof form] as boolean} onChange={setCheck(k)} className={checkCls} />
                <span className="text-sm text-neutral-700">{l}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Localização */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="font-semibold text-neutral-900 mb-4">Localização</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Bairro" required>
              <select value={form.bairroId as string} onChange={e => handleBairro(e.target.value)} className={inputCls} required>
                <option value="">Selecione o bairro</option>
                {bairros.map(b => <option key={b.id} value={b.id}>{b.nome} — {b.cidade.nome}</option>)}
              </select>
            </Field>
            <Field label="Endereço" required>
              <input value={form.endereco as string} onChange={set('endereco')} className={inputCls} placeholder="Rua, Avenida..." required />
            </Field>
            <Field label="Número">
              <input value={form.numero as string} onChange={set('numero')} className={inputCls} placeholder="S/N" />
            </Field>
            <Field label="Complemento">
              <input value={form.complemento as string} onChange={set('complemento')} className={inputCls} placeholder="Apto 102, Bloco A..." />
            </Field>
            <Field label="CEP">
              <input value={form.cep as string} onChange={set('cep')} className={inputCls} placeholder="00000-000" />
            </Field>
          </div>
        </div>

        {/* Diferenciais */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="font-semibold text-neutral-900 mb-4">Diferenciais</h2>
          <div className="flex gap-2 mb-3">
            <input
              value={diferencialInput}
              onChange={e => setDiferencialInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDiferencial() } }}
              className={inputCls}
              placeholder="Ex: Piscina, Academia, Portaria 24h..."
            />
            <button type="button" onClick={addDiferencial} className="px-4 py-2 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-100 transition-colors">
              Adicionar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(form.diferenciais as string[]).map(d => (
              <span key={d} className="flex items-center gap-1 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm">
                {d}
                <button type="button" onClick={() => removeDiferencial(d)} className="text-brand-400 hover:text-brand-700">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Fotos */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="font-semibold text-neutral-900 mb-1">Fotos e Vídeos</h2>
          <p className="text-xs text-neutral-400 mb-4">
            Primeira foto é a capa. Arraste para reordenar. JPG, PNG, WebP, MP4 — máx. 20 MB por arquivo.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4"
            className="hidden"
            onChange={handleFileUpload}
          />

          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingCount > 0}
              className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-100 transition-colors disabled:opacity-50"
            >
              {uploadingCount > 0 ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enviando {uploadingCount} arquivo(s)...
                </>
              ) : (
                '+ Adicionar fotos'
              )}
            </button>
            {uploadErro && <p className="text-xs text-red-600">{uploadErro}</p>}
          </div>

          {(form.fotos as Foto[]).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(form.fotos as Foto[]).map((foto, i) => (
                <div
                  key={foto.url}
                  draggable
                  onDragStart={e => handleDragStart(e, i)}
                  onDragOver={e => { e.preventDefault(); setDragOverIndex(i) }}
                  onDragLeave={() => setDragOverIndex(null)}
                  onDrop={e => handleDrop(e, i)}
                  className={`relative group rounded-lg overflow-hidden border bg-neutral-50 cursor-grab active:cursor-grabbing transition-all ${dragOverIndex === i ? 'border-brand-400 scale-95' : 'border-neutral-200'}`}
                >
                  {foto.url.endsWith('.mp4') ? (
                    <video src={foto.url} className="w-full h-36 object-cover" muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={foto.url} alt={`Foto ${i + 1}`} className="w-full h-36 object-cover" onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Foto' }} />
                  )}
                  {i === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-brand-500 text-white text-xs rounded font-medium">Capa</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removeFoto(foto.url)} className="p-1.5 bg-red-500/80 rounded text-white hover:bg-red-600 text-sm" title="Remover">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="font-semibold text-neutral-900 mb-4">SEO (opcional)</h2>
          <div className="grid grid-cols-1 gap-4">
            <Field label="Meta title (máx 70 chars)">
              <input value={form.metaTitle as string} onChange={set('metaTitle')} className={inputCls} maxLength={70} />
            </Field>
            <Field label="Meta description (máx 160 chars)">
              <textarea value={form.metaDescription as string} onChange={set('metaDescription')} className={inputCls} rows={2} maxLength={160} />
            </Field>
          </div>
        </div>

      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pb-8">
        <button type="button" onClick={() => router.push('/admin/imoveis')} className="px-5 py-2.5 border border-neutral-200 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50">
          {loading ? 'Salvando...' : imovelId ? 'Salvar alterações' : 'Criar imóvel'}
        </button>
      </div>
    </form>
  )
}
