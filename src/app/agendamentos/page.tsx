'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { Plus, Search, Calendar, DollarSign, Trash2, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatCurrency } from '@/lib/utils'

export default function AgendamentosPage() {
  const { data, addAppointment, deleteAppointment } = useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    amount: '',
    date: new Date().toISOString().slice(0, 16)
  })

  const filteredAppointments = useMemo(() => {
    return data.appointments.filter(a => 
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.service.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data.appointments, searchTerm])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addAppointment({
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString()
    })
    setIsModalOpen(false)
    setFormData({
      name: '',
      phone: '',
      service: '',
      amount: '',
      date: new Date().toISOString().slice(0, 16)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-gray-900">Agendamentos</h1>
        <p className="text-sm text-muted-foreground font-medium">Gerenciar todos os seus compromissos.</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-white border border-border rounded-[1.5rem] focus:outline-none shadow-sm text-sm"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredAppointments.map((appointment) => (
            <motion.div
              layout
              key={appointment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-5 rounded-[2rem] border border-border shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-lg shadow-inner">
                    {appointment.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-gray-900 leading-tight">{appointment.name}</h3>
                    <p className="text-xs font-bold text-muted-foreground">{appointment.phone}</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteAppointment(appointment.id)}
                  className="w-10 h-10 flex items-center justify-center text-red-500 bg-red-50 rounded-xl"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex gap-4 text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  {format(new Date(appointment.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">•</span>
                  {appointment.service}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-purple-600" />
                  {formatCurrency(appointment.amount)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-border shadow-inner">
            <Calendar className="mx-auto text-muted-foreground/30 mb-4" size={48} strokeWidth={1} />
            <p className="text-muted-foreground font-bold text-sm">Nenhum agendamento encontrado.</p>
          </div>
        )}
      </div>

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
                <h2 className="text-xl font-black text-gray-900">Novo Agendamento</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-500"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Nome</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do cliente"
                    className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Telefone</label>
                  <input 
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Serviço</label>
                  <input 
                    required
                    type="text"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    placeholder="Serviço realizado"
                    className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Valor Cobrado</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Data e Hora</label>
                  <input 
                    required
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/30 active:scale-95 transition-all"
                  >
                    Salvar Agendamento
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
