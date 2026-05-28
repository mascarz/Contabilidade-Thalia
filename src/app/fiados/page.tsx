'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  X,
  User,
  Phone,
  Calendar,
  DollarSign,
  Scissors
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatCurrency } from '@/lib/utils'

export default function FiadosPage() {
  const { data, addFiado, updateFiado, deleteFiado, addClient, updateClient } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    service: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  })

  const filteredFiados = data.fiados.filter(f => 
    f.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.service.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPending = useMemo(() => {
    return data.fiados
      .filter(f => f.status === 'pending')
      .reduce((acc, curr) => acc + curr.amount, 0)
  }, [data.fiados])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if client exists
    let clientId = 'manual'
    const existingClient = data.clients.find(c => c.phone === formData.clientPhone)
    if (existingClient) {
      clientId = existingClient.id
      // Update name if provided
      if (formData.clientName && existingClient.name !== formData.clientName) {
        updateClient(existingClient.id, { name: formData.clientName })
      }
    } else {
      // Create new client
      const newClient = addClient({
        name: formData.clientName,
        phone: formData.clientPhone,
      })
      clientId = newClient.id
    }
    
    addFiado({
      ...formData,
      clientId: clientId, 
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
      status: 'pending'
    })
    setIsModalOpen(false)
    setFormData({
      clientName: '',
      clientPhone: '',
      service: '',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    })
  }

  const markAsPaid = (id: string) => {
    updateFiado(id, { status: 'paid' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-gray-900">Pendências</h1>
        <p className="text-sm text-muted-foreground font-medium">Controle de fiados e cobranças.</p>
      </div>

      {/* Card de Resumo - Estilo App */}
      <div className="bg-amber-500 rounded-[2.5rem] p-6 shadow-lg shadow-amber-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
            <Clock size={28} strokeWidth={3} />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] mb-1">Total Pendente</p>
            <h3 className="text-3xl font-black text-white">{formatCurrency(totalPending)}</h3>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text"
            placeholder="Buscar por cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-white border border-border rounded-2xl focus:outline-none shadow-sm text-sm"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 active:scale-90 transition-all"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode='popLayout'>
          {filteredFiados.map((fiado) => {
            const isOverdue = fiado.status === 'pending' && differenceInDays(new Date(), new Date(fiado.date)) > 7
            return (
              <motion.div
                key={fiado.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "bg-white p-4 rounded-[2rem] border shadow-sm flex flex-col gap-4 relative overflow-hidden",
                  fiado.status === 'paid' ? "opacity-50 grayscale border-border" : isOverdue ? "border-red-200 bg-red-50/20" : "border-border"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg",
                      fiado.status === 'paid' ? "bg-gray-100 text-gray-400" : isOverdue ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                    )}>
                      {fiado.clientName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 leading-tight">{fiado.clientName}</h3>
                      <p className="text-xs font-bold text-muted-foreground/80">{fiado.clientPhone}</p>
                    </div>
                  </div>
                  {fiado.status === 'pending' && (
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                      isOverdue ? "bg-red-100 text-red-600 animate-pulse" : "bg-amber-100 text-amber-600"
                    )}>
                      {isOverdue ? <AlertCircle size={10} strokeWidth={3} /> : <Clock size={10} strokeWidth={3} />}
                      {isOverdue ? 'Atrasado' : 'Pendente'}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50/80 p-4 rounded-2xl flex items-center justify-between border border-gray-100/50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{fiado.service}</p>
                    <p className="text-[10px] font-bold text-muted-foreground/60">{format(new Date(fiado.date), "dd/MM/yyyy")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-gray-900">{formatCurrency(fiado.amount)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {fiado.status === 'pending' && (
                    <button 
                      onClick={() => markAsPaid(fiado.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-4 rounded-[1.2rem] font-black text-xs uppercase tracking-wider shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                    >
                      <CheckCircle2 size={18} strokeWidth={3} />
                      Marcar como Pago
                    </button>
                  )}
                  <button 
                    onClick={() => deleteFiado(fiado.id)}
                    className="w-14 h-14 flex items-center justify-center bg-red-50 text-red-500 rounded-[1.2rem] active:scale-95 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredFiados.length === 0 && (
          <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-border shadow-inner">
            <Clock className="mx-auto text-muted-foreground/30 mb-4" size={48} strokeWidth={1} />
            <p className="text-muted-foreground font-bold text-sm">Nenhum fiado pendente.</p>
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
                <h2 className="text-xl font-black text-gray-900">Novo Fiado</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-500"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Nome do Cliente</label>
                  <input 
                    required
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    placeholder="Nome completo"
                    className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-amber-200 outline-none font-bold text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">WhatsApp / Telefone</label>
                  <input 
                    required
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                    placeholder="(11) 99999-9999"
                    className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-amber-200 outline-none font-bold text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Serviço Realizado</label>
                  <input 
                    required
                    type="text"
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                    placeholder="Ex: Sobrancelha"
                    className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-amber-200 outline-none font-bold text-sm"
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
                      className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-amber-200 outline-none font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Data</label>
                    <input 
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-amber-200 outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-amber-500 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
                  >
                    Adicionar Fiado
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
