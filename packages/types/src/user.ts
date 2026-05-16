export type UserRole = 'ADMIN' | 'CORRETOR' | 'EDITOR'

export interface User {
  id: string
  nome: string
  email: string
  role: UserRole
  ativo: boolean
  createdAt: string
  updatedAt: string
}
