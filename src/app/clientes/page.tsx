'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { 
  Plus, 
  Search, 
  MessageCircle, 
  Phone, 
  Edit2, 
  Trash2, 
  X,
  Calendar,
  DollarSign,
  User,
  History,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatCurrency } from '@/lib/utils'
import { Client, Transaction, Fiado } from '@/types'

export default function ClientsPage() {
  const { data, addClient, updateClient, deleteClient } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    lastService: '',
    lastValue: '',
    observations: ''
  })

  const filteredClients = data.clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  )

  const clientHistory = selectedClient ? {
    transactions: data.transactions.filter(t => t.clientId === selectedClient.id || t.description.toLowerCase().includes(selectedClient.name.toLowerCase())),
    fiados: data.fiados.filter(f => f.clientId === selectedClient.id || f.clientName.toLowerCase() === selectedClient.name.toLowerCase())
  } : { transactions: [], fiados: [] }

  const handleOpenModal = (client: Client | null = null) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        name: client.name,
        phone: client.phone,
        lastService: client.lastService || '',
        lastValue: client.lastValue?.toString() || '',
        observations: client.observations || ''
      })
    } else {
      setEditingClient(null)
      setFormData({
        name: '',
        phone: '',
        lastService: '',
        lastValue: '',
        observations: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const clientData = {
      ...formData,
      lastValue: formData.lastValue ? parseFloat(formData.lastValue) : 0
    }

    if (editingClient) {
      updateClient(editingClient.id, clientData)
    } else {
      addClient(clientData)
    }
    setIsModalOpen(false)
  }

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    const message = encodeURIComponent(`Olá ${name}, tudo bem? Aqui é do Studio Thalia Abdo 💕`)
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-gray-900">Clientes</h1>
        <p className="text-sm text-muted-foreground font-medium">Sua agenda e contatos sempre à mão.</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-[1.5rem] focus:outline-none shadow-sm text-sm"
          />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-all"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode='popLayout'>
          {filteredClients.map((client) => (
            <motion.div
              key={client.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-4 rounded-[2rem] border border-border shadow-sm flex flex-col gap-4 active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-orange-100 text-primary flex items-center justify-center font-black text-xl shadow-inner">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-gray-900 leading-tight">{client.name}</h3>
                    <p className="text-xs font-bold text-muted-foreground/80 mt-0.5">{client.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedClient(client)
                      setIsHistoryModalOpen(true)
                    }}
                    className="w-10 h-10 flex items-center justify-center text-blue-500 bg-blue-50 rounded-xl"
                    title="Histórico"
                  >
                    <History size={16} />
                  </button>
                  <button 
                    onClick={() => handleOpenModal(client)}
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground bg-gray-100 rounded-xl"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => deleteClient(client.id)}
                    className="w-10 h-10 flex items-center justify-center text-red-500 bg-red-50 rounded-xl"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Último Serviço</p>
                  <p className="text-xs font-bold text-gray-700 truncate">{client.lastService || 'Não registrado'}</p>
                </div>
                <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-100/50">
                  <p className="text-[10px] text-primary/80 uppercase font-black tracking-widest mb-1">Valor</p>
                  <p className="text-xs font-black text-primary">{client.lastValue ? formatCurrency(client.lastValue) : 'R$ 0,00'}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => openWhatsApp(client.phone, client.name)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-wider shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                >
                  <MessageCircle size={18} strokeWidth={3} />
                  Enviar WhatsApp
                </button>
                <a 
                  href={`tel:${client.phone}`}
                  className="w-14 h-14 flex items-center justify-center bg-blue-100 text-blue-600 rounded-[1.5rem] active:scale-95 transition-all"
                >
                  <Phone size={20} strokeWidth={3} />
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-border shadow-inner">
          <User className="mx-auto text-muted-foreground/30 mb-4" size={48} strokeWidth={1} />
          <p className="text-muted-foreground font-bold text-sm">Nenhuma cliente encontrada.</p>
        </div>
      )}

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
                <h2 className="text-xl font-black text-gray-900">
                  {editingClient ? 'Editar Cliente' : 'Nova Cliente'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-500"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Nome Completo</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Thalia Abdo"
                    className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">WhatsApp / Telefone</label>
                  <input 
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Ex: 11999999999"
                    className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Serviço</label>
                    <input 
                      type="text"
                      value={formData.lastService}
                      onChange={(e) => setFormData({...formData, lastService: e.target.value})}
                      placeholder="Ex: Sobrancelha"
                      className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Valor (R$)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={formData.lastValue}
                      onChange={(e) => setFormData({...formData, lastValue: e.target.value})}
                      placeholder="0,00"
                      className="w-full px-5 py-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Observações</label>
                  <textarea 
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm min-h-[80px]"
                    placeholder="Algum detalhe importante..."
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/30 active:scale-95 transition-all"
                  >
                    {editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal IOS Style - Histórico do Cliente */}
      <AnimatePresence>
        {isHistoryModalOpen && selectedClient && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full bg-white rounded-t-[3rem] p-6 pb-12 shadow-2xl max-w-lg mx-auto max-h-[90vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Histórico</h2>
                  <p className="text-sm font-bold text-muted-foreground">{selectedClient.name}</p>
                </div>
                <button 
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-500"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Resumo do Cliente */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Total Gasto</p>
                    <p className="text-lg font-black text-blue-700">
                      {formatCurrency(clientHistory.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0))}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-3xl border border-orange-100">
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Fiados Pendentes</p>
                    <p className="text-lg font-black text-orange-700">
                      {formatCurrency(clientHistory.fiados.filter(f => f.status === 'pending').reduce((acc, f) => acc + f.amount, 0))}
                    </p>
                  </div>
                </div>

                {/* Lista de Atividades */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Atividades Recentes</h3>
                  
                  {[...clientHistory.transactions, ...clientHistory.fiados]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((item, idx) => {
                      const isTransaction = 'type' in item;
                      return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              isTransaction 
                                ? (item.type === 'income' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")
                                : "bg-orange-100 text-orange-600"
                            )}>
                              {isTransaction 
                                ? (item.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />)
                                : <Clock size={18} />
                              }
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 leading-tight">
                                {isTransaction ? item.description : `Fiado: ${item.service}`}
                              </p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">
                                {format(new Date(item.date), "dd 'de' MMMM", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                          <p className={cn(
                            "text-sm font-black",
                            isTransaction 
                              ? (item.type === 'income' ? "text-green-600" : "text-red-600")
                              : "text-orange-600"
                          )}>
                            {isTransaction && item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                          </p>
                        </div>
                      );
                    })
                  }

                  {clientHistory.transactions.length === 0 && clientHistory.fiados.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm font-bold text-muted-foreground">Nenhuma atividade registrada.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
