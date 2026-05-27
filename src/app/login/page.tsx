'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Logo } from '@/components/ui/Logo'
import { Lock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = login(password)
    if (!success) {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-12">
          <Logo className="scale-125 mb-4" />
          <p className="text-muted-foreground mt-2 font-medium">Contabilidade Profissional</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Senha de Acesso</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-4 bg-muted border ${error ? 'border-red-500' : 'border-border'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                placeholder="Digite sua senha..."
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">Senha incorreta. Tente novamente.</p>}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-primary text-white font-semibold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            Entrar no Sistema
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-12">
          &copy; 2026 Studio Thalia Abdo. Todos os direitos reservados.
        </p>
      </motion.div>
    </div>
  )
}
