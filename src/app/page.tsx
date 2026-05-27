'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { FinancialChart } from '@/components/dashboard/FinancialChart'
import { cn } from '@/lib/utils'
import { 
  subDays, 
  startOfMonth, 
  startOfYear, 
  isWithinInterval, 
  format, 
  eachDayOfInterval, 
  isSameDay 
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Scissors, Users } from 'lucide-react'

type FilterPeriod = 'hoje' | '7dias' | '14dias' | '30dias' | 'mensal' | 'anual'

export default function DashboardPage() {
  const { data } = useApp()
  const [period, setPeriod] = useState<FilterPeriod>('30dias')

  const filteredData = useMemo(() => {
    const now = new Date()
    let start: Date

    switch (period) {
      case 'hoje': start = now; break
      case '7dias': start = subDays(now, 7); break
      case '14dias': start = subDays(now, 14); break
      case '30dias': start = subDays(now, 30); break
      case 'mensal': start = startOfMonth(now); break
      case 'anual': start = startOfYear(now); break
      default: start = subDays(now, 30)
    }

    const interval = { start, end: now }

    const transactions = data.transactions.filter(t => 
      isWithinInterval(new Date(t.date), interval)
    )

    const clientsInPeriod = data.clients.filter(c => 
      isWithinInterval(new Date(c.createdAt), interval)
    ).length

    const fiadosPending = data.fiados
      .filter(f => f.status === 'pending')
      .reduce((acc, curr) => acc + curr.amount, 0)

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0)

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0)

    const servicosCount = transactions.filter(t => t.type === 'income').length

    // Chart data
    const chartDays = eachDayOfInterval(interval)
    const chartData = chartDays.map(day => {
      const dayTransactions = transactions.filter(t => isSameDay(new Date(t.date), day))
      const dayIncome = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0)
      const dayExpense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0)

      return {
        name: format(day, 'dd/MM', { locale: ptBR }),
        entradas: dayIncome,
        saidas: dayExpense,
        lucro: dayIncome - dayExpense
      }
    })

    return {
      faturamento: income,
      entradas: income,
      saidas: expense,
      clientes: clientsInPeriod,
      servicos: servicosCount,
      fiados: fiadosPending,
      chartData
    }
  }, [data, period])

  return (
    <div className="space-y-6">
      {/* Header Mobile Otimizado */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-gray-900">Olá, Thalia! 👋</h1>
        <p className="text-sm text-muted-foreground font-medium">Veja como está o seu estúdio hoje.</p>
      </div>

      {/* Seletor de Período Estilo Pílula */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide no-scrollbar">
        {[
          { id: 'hoje', label: 'Hoje' },
          { id: '7dias', label: '7 Dias' },
          { id: '30dias', label: '30 Dias' },
          { id: 'mensal', label: 'Este Mês' },
          { id: 'anual', label: 'Este Ano' }
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id as FilterPeriod)}
            className={cn(
              "whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all border",
              period === p.id 
                ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                : "bg-white text-muted-foreground border-border hover:bg-gray-50"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <SummaryCards 
        faturamento={filteredData.faturamento}
        entradas={filteredData.entradas}
        saidas={filteredData.saidas}
        clientes={filteredData.clientes}
        servicos={filteredData.servicos}
        fiados={filteredData.fiados}
      />

      {/* Gráfico Otimizado */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-border shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-black tracking-tight text-gray-900">Fluxo de Caixa</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Ganhos vs Gastos</p>
          </div>
          <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] font-black text-primary uppercase">Lucro</span>
          </div>
        </div>
        <div className="h-[280px] w-full">
          <FinancialChart data={filteredData.chartData} />
        </div>
      </div>

      {/* Ações Rápidas Mobile */}
      <div className="grid grid-cols-2 gap-4 pb-4">
        <button className="flex flex-col items-center justify-center gap-3 bg-white p-6 rounded-[2rem] border border-border shadow-sm active:scale-95 transition-transform">
          <div className="p-3 bg-orange-100 text-primary rounded-2xl">
            <Scissors size={24} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-gray-700">Novo Serviço</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-3 bg-white p-6 rounded-[2rem] border border-border shadow-sm active:scale-95 transition-transform">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
            <Users size={24} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-gray-700">Novo Cliente</span>
        </button>
      </div>
    </div>
  )
}
