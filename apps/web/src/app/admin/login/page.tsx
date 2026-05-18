'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { adminApi, setToken } from '../../../lib/admin-api'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const res = await adminApi.login(email, senha)
      setToken(res.token)
      router.push('/admin/dashboard')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-modal p-8 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="IMOV" width={140} height={48} className="h-12 w-auto" />
        </div>

        <h1 className="text-xl font-bold text-neutral-900 text-center mb-1">Painel Administrativo</h1>
        <p className="text-sm text-neutral-500 text-center mb-6">Acesso restrito</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              placeholder="admin@imovimobiliaria.com.br"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {erro && (
            <div className="bg-danger-50 text-danger-600 text-sm px-4 py-2.5 rounded-lg">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
