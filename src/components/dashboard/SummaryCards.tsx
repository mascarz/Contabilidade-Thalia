'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, Scissors, Wallet, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type SummaryCardProps = {
  title: string
  value: string | number
  icon: any
  color: string
  delay?: number
}

function SummaryCard({ title, value, icon: Icon, color, delay = 0 }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-white p-4 rounded-[2rem] border border-border flex flex-col gap-3 shadow-sm active:shadow-inner active:bg-gray-50 transition-all"
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color} shadow-lg shadow-inherit/20`}>
        <Icon className="text-white" size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{title}</p>
        <h3 className="text-lg font-black mt-0.5 text-gray-900">{value}</h3>
      </div>
    </motion.div>
  )
}

export function SummaryCards({ 
  faturamento, 
  entradas, 
  saidas, 
  clientes, 
  servicos, 
  fiados 
}: { 
  faturamento: number
  entradas: number
  saidas: number
  clientes: number
  servicos: number
  fiados: number
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <SummaryCard 
        title="Faturamento" 
        value={formatCurrency(faturamento)} 
        icon={TrendingUp} 
        color="bg-green-500" 
        delay={0.1}
      />
      <SummaryCard 
        title="Clientes" 
        value={clientes} 
        icon={Users} 
        color="bg-blue-500" 
        delay={0.2}
      />
      <SummaryCard 
        title="Saídas" 
        value={formatCurrency(saidas)} 
        icon={TrendingDown} 
        color="bg-red-500" 
        delay={0.3}
      />
      <SummaryCard 
        title="Fiados" 
        value={formatCurrency(fiados)} 
        icon={Clock} 
        color="bg-amber-500" 
        delay={0.4}
      />
    </div>
  )
}
