'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Clock, 
  MessageSquare, 
  LogOut,
  Menu,
  X,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

import { Logo } from '@/components/ui/Logo'

const navItems = [
  { label: 'Início', href: '/', icon: LayoutDashboard },
  { label: 'Clientes', href: '/clientes', icon: Users },
  { label: 'Agendamentos', href: '/agendamentos', icon: Calendar },
  { label: 'Financeiro', href: '/financeiro', icon: Wallet },
  { label: 'Fiados', href: '/fiados', icon: Clock },
  { label: 'Mensagens', href: '/mensagens', icon: MessageSquare },
]

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)

  if (pathname === '/login') return <>{children}</>

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-0 md:pl-64">
      {/* Desktop Sidebar (Hide on Mobile) */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-border bg-white md:block">
        <div className="flex h-full flex-col p-6">
          <Logo className="mb-10" />

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <button
            onClick={logout}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar - App Style */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white/80 px-4 backdrop-blur-lg md:hidden">
        <div className="flex items-center gap-2">
          <Logo iconOnly className="h-8 w-8" />
          <span className="text-base font-bold tracking-tight">Studio <span className="text-primary">Thalia</span></span>
        </div>
        <button 
          onClick={logout}
          className="rounded-full p-2 text-red-500 bg-red-50"
          title="Sair"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {children}
      </main>

      {/* Mobile Bottom Nav - IOS Style */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-border bg-white/90 px-2 py-3 pb-8 backdrop-blur-lg md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[64px] transition-all relative",
                isActive ? "text-primary" : "text-muted-foreground/60"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-all",
                isActive && "bg-primary/10"
              )}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="bottomNavTab"
                  className="absolute -top-3 h-1 w-8 bg-primary rounded-full"
                />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
