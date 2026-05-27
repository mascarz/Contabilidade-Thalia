'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Calendar, 
  DollarSign, 
  Tag, 
  User,
  X,
  Trash2,
  ChevronDown,
  Wallet
} from 'lucide-react'
import { format, subDays, startOfMonth, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatCurrency } from '@/lib/utils'

export default function FinancePage() {
  const { data, addTransaction, deleteTransaction } = useApp()
  const [activeTab, setActiveTab] = useState<'todos' | 'income' | 'expense'>('todos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    description: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    clientId: '',
    paymentMethod: 'Pix'
  })

  const filteredTransactions = useMemo(() => {
    return data.transactions.filter(t => {
      const matchesTab = activeTab === 'todos' || t.type === activeTab
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.category?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesTab && matchesSearch
    })
  }, [data.transactions, activeTab, searchTerm])

  const totals = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
    return { income, expense, balance: income - expense }
  }, [filteredTransactions])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addTransaction({
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
    })
    setIsModalOpen(false)
    setFormData({
      type: 'income',
      description: '',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      category: '',
      clientId: '',
      paymentMethod: 'Pix'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-gray-900">Financeiro</h1>
        <p className="text-sm text-muted-foreground font-medium">Controle total do seu dinheiro.</p>
      </div>

      {/* Cards de Saldo - Estilo Minimalista Premium */}
      <div className="bg-white rounded-[2.5rem] border border-border p-6 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Saldo em Caixa</p>
        <h2 className="text-3xl font-black text-gray-900 mb-6">{formatCurrency(totals.balance)}</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <TrendingUp size={16} strokeWidth={3} />
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase">Entradas</p>
              <p className="text-sm font-black text-green-600">{formatCurrency(totals.income)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">
              <TrendingDown size={16} strokeWidth={3} />
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase">Saídas</p>
              <p className="text-sm font-black text-red-500">{formatCurrency(totals.expense)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Filtros Estilo App */}
        <div className="flex bg-white p-1 rounded-2xl border border-border">
          {['todos', 'income', 'expense'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                activeTab === tab 
                  ? (tab === 'income' ? "bg-green-100 text-green-700" : tab === 'expense' ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-900")
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === 'todos' ? 'Tudo' : tab === 'income' ? 'Entradas' : 'Saídas'}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              placeholder="Buscar transação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-white border border-border rounded-2xl focus:outline-none shadow-sm text-sm"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-all"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="space-y-3">
        <AnimatePresence mode='popLayout'>
          {filteredTransactions.map((t) => (
            <motion.div
              layout
              key={t.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-4 rounded-[1.5rem] border border-border shadow-sm flex items-center justify-between active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                  t.type === 'income' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                )}>
                  {t.type === 'income' ? <TrendingUp size={20} strokeWidth={3} /> : <TrendingDown size={20} strokeWidth={3} />}
                </div>
                <div>
                  <h4 className="font-black text-sm text-gray-900 leading-tight">{t.description}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                      {format(new Date(t.date), "dd MMM", { locale: ptBR })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                      {t.category || 'Geral'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={cn(
                    "font-black text-sm",
                    t.type === 'income' ? "text-green-600" : "text-red-500"
                  )}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">{t.paymentMethod}</p>
                </div>
                <button 
                  onClick={() => deleteTransaction(t.id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-border shadow-inner">
            <Wallet className="mx-auto text-muted-foreground/30 mb-4" size={48} strokeWidth={1} />
            <p className="text-muted-foreground font-bold text-sm">Nenhuma transação encontrada.</p>
          </div>
        )}
      </div>

      {/* Modal IOS Style */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full bg-white rounded-t-[3rem] p-6 pb-12 shadow-2xl max-w-lg mx-auto"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
              
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-gray-900">Nova Transação</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-500"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Tipo de Transação Switch */}
                <div className="flex bg-gray-100 p-1.5 rounded-[1.2rem]">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'income'})}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      formData.type === 'income' ? "bg-white text-green-600 shadow-sm" : "text-muted-foreground"
                    )}
                  >
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'expense'})}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      formData.type === 'expense' ? "bg-white text-red-500 shadow-sm" : "text-muted-foreground"
                    )}
                  >
                    Saída
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Descrição</label>
                  <input 
                    required
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Ex: Aluguel, Venda de Produto..."
                    className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Valor (R$)</label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="0,00"
                      className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Data</label>
                    <input 
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Categoria</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm appearance-none"
                    >
                      <option value="">Geral</option>
                      <option value="Serviço">Serviço</option>
                      <option value="Produto">Produto</option>
                      <option value="Aluguel">Aluguel</option>
                      <option value="Material">Material</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Pagamento</label>
                    <select 
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm appearance-none"
                    >
                      <option value="Pix">Pix</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Cartão Crédito">Cartão Crédito</option>
                      <option value="Cartão Débito">Cartão Débito</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/30 active:scale-95 transition-all"
                  >
                    Confirmar Transação
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
