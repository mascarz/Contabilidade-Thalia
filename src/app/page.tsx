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
    <div className="space-y-8">
      {/* Header Mobile Otimizado */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display italic">
          Studio <span className="text-primary not-italic">Thalia Abdo</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium">Gestão inteligente para o seu espaço.</p>
      </div>

      {/* Seletor de Período Estilo Pílula */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
        {[
          { id: 'hoje', label: 'Hoje' },
          { id: '7dias', label: '7 Dias' },
          { id: '30dias', label: '30 Dias' },
          { id: 'mensal', label: 'Mês' },
          { id: 'anual', label: 'Ano' }
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id as FilterPeriod)}
            className={cn(
              "whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
              period === p.id 
                ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200" 
                : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
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

      {/* Ações Rápidas Mobile - Design Empresa Grande */}
      <div className="grid grid-cols-2 gap-4">
        <button className="flex flex-col items-start justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm active:scale-95 transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="p-3 bg-white shadow-md text-primary rounded-2xl relative z-10">
            <Scissors size={20} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Serviços</p>
            <span className="text-sm font-black text-slate-800">Novo Registro</span>
          </div>
        </button>
        <button className="flex flex-col items-start justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm active:scale-95 transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="p-3 bg-white shadow-md text-blue-600 rounded-2xl relative z-10">
            <Users size={20} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clientes</p>
            <span className="text-sm font-black text-slate-800">Novo Cadastro</span>
          </div>
        </button>
      </div>

      {/* Gráfico Otimizado */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 font-display">Fluxo de Caixa</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Análise de Rendimento</p>
          </div>
          <div className="flex items-center gap-1.5 bg-orange-50 px-4 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-black text-primary uppercase tracking-tighter">Ao Vivo</span>
          </div>
        </div>
        <div className="h-[280px] w-full">
          <FinancialChart data={filteredData.chartData} />
        </div>
      </div>
    </div>
  )
}
