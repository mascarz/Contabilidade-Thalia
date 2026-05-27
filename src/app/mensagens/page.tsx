'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { 
  MessageSquare, 
  Settings, 
  Send, 
  Clock, 
  User, 
  Calendar,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Layout
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Client } from '@/types'

interface ClientToMessage extends Client {
  daysSinceLastService: number
  type: number
}

export default function MessagesPage() {
  const { data, updateMessageConfig } = useApp()
  const [activeTab, setActiveTab] = useState<'pendentes' | 'config'>('pendentes')

  const clientsToMessage = useMemo(() => {
    const now = new Date()
    return data.clients.map(client => {
      const daysSinceLastService = differenceInDays(now, new Date(client.createdAt)) // Using createdAt as lastService for demo
      
      const config7 = data.messageConfigs.find(c => c.days === 7)
      const config14 = data.messageConfigs.find(c => c.days === 14)
      const config30 = data.messageConfigs.find(c => c.days === 30)

      let type = 0
      if (daysSinceLastService >= 30 && config30?.enabled) type = 30
      else if (daysSinceLastService >= 14 && config14?.enabled) type = 14
      else if (daysSinceLastService >= 7 && config7?.enabled) type = 7

      return { ...client, daysSinceLastService, type }
    }).filter(c => c.type > 0).sort((a, b) => b.daysSinceLastService - a.daysSinceLastService)
  }, [data.clients, data.messageConfigs])

  const sendMessage = (client: ClientToMessage) => {
    const config = data.messageConfigs.find(c => c.days === client.type)
    if (!config) return

    const message = config.template.replace('[Nome]', client.name)
    const cleanPhone = client.phone.replace(/\D/g, '')
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-gray-900">Fidelização</h1>
        <p className="text-sm text-muted-foreground font-medium">Encante e traga suas clientes de volta.</p>
      </div>

      {/* Tabs Estilo App */}
      <div className="flex bg-white p-1 rounded-2xl border border-border">
        <button 
          onClick={() => setActiveTab('pendentes')}
          className={cn(
            "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
            activeTab === 'pendentes' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground"
          )}
        >
          <MessageSquare size={16} strokeWidth={3} />
          Pendentes
        </button>
        <button 
          onClick={() => setActiveTab('config')}
          className={cn(
            "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
            activeTab === 'config' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground"
          )}
        >
          <Settings size={16} strokeWidth={3} />
          Ajustes
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'pendentes' ? (
          <motion.div
            key="pendentes"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {clientsToMessage.map((client) => (
              <motion.div
                key={client.id}
                layout
                className="bg-white p-5 rounded-[2.5rem] border border-border shadow-sm flex flex-col gap-5 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 text-primary flex items-center justify-center font-black text-xl shadow-inner">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 leading-tight">{client.name}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Viu você há {client.daysSinceLastService} dias</p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm",
                    client.type === 30 ? "bg-red-100 text-red-600" : 
                    client.type === 14 ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                  )}>
                    Lembrete {client.type}d
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 relative">
                  <span className="absolute -top-2 left-4 px-2 bg-gray-50 text-[9px] font-black text-muted-foreground/40 uppercase tracking-tighter">Prévia da Mensagem</span>
                  <p className="text-xs text-gray-600 italic leading-relaxed">
                    "{data.messageConfigs.find(c => c.days === client.type)?.template.replace('[Nome]', client.name)}"
                  </p>
                </div>

                <button 
                  onClick={() => sendMessage(client)}
                  className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                >
                  <Send size={18} strokeWidth={3} />
                  Enviar no WhatsApp
                </button>
              </motion.div>
            ))}

            {clientsToMessage.length === 0 && (
              <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-border shadow-inner">
                <CheckCircle2 className="mx-auto text-green-500/30 mb-4" size={56} strokeWidth={1} />
                <p className="text-muted-foreground font-black text-sm uppercase tracking-wider">Tudo em dia! ✨</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Nenhuma cliente precisa de retorno agora.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="config"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {data.messageConfigs.map((config) => (
              <div key={config.days} className="bg-white p-6 rounded-[2.5rem] border border-border shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                      <Clock size={22} strokeWidth={3} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 leading-tight">Alerta {config.days} Dias</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Frequência de disparo</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer scale-110">
                    <input 
                      type="checkbox" 
                      checked={config.enabled} 
                      onChange={(e) => updateMessageConfig(config.days, { enabled: e.target.checked })}
                      className="sr-only peer" 
                    />
                    <div className="w-12 h-6.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2">Modelo da Mensagem</label>
                  <textarea 
                    value={config.template}
                    onChange={(e) => updateMessageConfig(config.days, { template: e.target.value })}
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm min-h-[120px] leading-relaxed"
                    placeholder="Escreva algo carinhoso..."
                  />
                  <div className="flex items-center gap-2 px-2">
                    <Sparkles size={12} className="text-orange-500" />
                    <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Use <span className="text-primary font-black">[Nome]</span> para personalizar cada envio.</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                <Sparkles size={20} strokeWidth={3} />
              </div>
              <div>
                <h4 className="font-black text-orange-800 text-xs uppercase tracking-wider">Dica de Sucesso</h4>
                <p className="text-orange-700/80 text-xs mt-1 leading-relaxed font-medium">
                  Mensagens personalizadas aumentam o retorno das clientes em até 40%. 
                  Adicione emojis para deixar o texto mais leve e amigável! 💕
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
