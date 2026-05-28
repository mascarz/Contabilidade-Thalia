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
  Layout,
  Globe,
  Zap,
  Users
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Client, ApiConfig } from '@/types'

interface ClientToMessage extends Client {
  daysSinceLastService: number
  type: number
}

export default function MessagesPage() {
  const { data, updateMessageConfig, updateApiConfig, sendMessageViaApi } = useApp()
  const [activeTab, setActiveTab] = useState<'pendentes' | 'massa' | 'api' | 'config'>('pendentes')
  const [isSendingAll, setIsSendingAll] = useState(false)
  const [bulkMessage, setBulkMessage] = useState('Olá [Nome], tudo bem? Temos novidades aqui no Studio Thalia Abdo 💕')
  const [apiForm, setApiForm] = useState<ApiConfig>(data.apiConfig || { baseUrl: '', token: '', instance: '' })

  const clientsToMessage = useMemo(() => {
    const now = new Date()
    return data.clients.map(client => {
      const daysSinceLastService = differenceInDays(now, new Date(client.createdAt)) 
      
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

  const sendMessage = async (client: Client | ClientToMessage, customMessage?: string) => {
    let message = ''
    if (customMessage) {
      message = customMessage.replace('[Nome]', client.name)
    } else {
      const c = client as ClientToMessage
      const config = data.messageConfigs.find(conf => conf.days === c.type)
      if (!config) return
      message = config.template.replace('[Nome]', client.name)
    }

    if (data.apiConfig?.baseUrl) {
      await sendMessageViaApi(client.phone, message)
    } else {
      const cleanPhone = client.phone.replace(/\D/g, '')
      window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  const sendAllMessages = async (type: 'fidelizacao' | 'bulk') => {
    const targets = type === 'fidelizacao' ? clientsToMessage : data.clients
    if (targets.length === 0) return
    
    setIsSendingAll(true)
    
    for (const client of targets) {
      let message = ''
      if (type === 'fidelizacao') {
        const c = client as ClientToMessage
        const config = data.messageConfigs.find(conf => conf.days === c.type)
        if (config) message = config.template.replace('[Nome]', client.name)
      } else {
        message = bulkMessage.replace('[Nome]', client.name)
      }

      if (message) {
        if (data.apiConfig?.baseUrl) {
          await sendMessageViaApi(client.phone, message)
        } else {
          const cleanPhone = client.phone.replace(/\D/g, '')
          window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    setIsSendingAll(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight font-display">Fidelização</h1>
        <p className="text-sm text-slate-500 font-medium">Encante e traga suas clientes de volta.</p>
      </div>

      {/* Botão Enviar Para Todas */}
      {activeTab === 'pendentes' && clientsToMessage.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => sendAllMessages('fidelizacao')}
          disabled={isSendingAll}
          className={cn(
            "w-full py-5 rounded-3xl font-black text-xs uppercase tracking-[0.15em] shadow-xl transition-all flex items-center justify-center gap-3",
            isSendingAll 
              ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
              : "bg-gradient-to-r from-primary to-orange-600 text-white shadow-orange-200 hover:shadow-orange-300 active:scale-[0.98]"
          )}
        >
          {isSendingAll ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              Disparando via API...
            </>
          ) : (
            <>
              <Sparkles size={18} strokeWidth={3} />
              Disparo Automático ({clientsToMessage.length})
            </>
          )}
        </motion.button>
      )}

      {/* Tabs Estilo App */}
      <div className="flex bg-white p-1 rounded-2xl border border-border overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('pendentes')}
          className={cn(
            "flex-1 min-w-[100px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
            activeTab === 'pendentes' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground"
          )}
        >
          <Clock size={14} strokeWidth={3} />
          Fidelizar
        </button>
        <button 
          onClick={() => setActiveTab('massa')}
          className={cn(
            "flex-1 min-w-[100px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
            activeTab === 'massa' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground"
          )}
        >
          <Users size={14} strokeWidth={3} />
          Massa
        </button>
        <button 
          onClick={() => setActiveTab('api')}
          className={cn(
            "flex-1 min-w-[100px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
            activeTab === 'api' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground"
          )}
        >
          <Zap size={14} strokeWidth={3} />
          APISend
        </button>
        <button 
          onClick={() => setActiveTab('config')}
          className={cn(
            "flex-1 min-w-[100px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
            activeTab === 'config' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground"
          )}
        >
          <Settings size={14} strokeWidth={3} />
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
                  Enviar Individual
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
        ) : activeTab === 'massa' ? (
          <motion.div
            key="massa"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-[2.5rem] border border-border shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
                  <Users size={28} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg leading-tight">Envio em Massa</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Enviar para todas as {data.clients.length} clientes</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-2">Mensagem para Todas</label>
                <textarea 
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-purple-200 outline-none font-bold text-sm min-h-[150px] leading-relaxed"
                  placeholder="Escreva a mensagem para todas..."
                />
                <div className="flex items-center gap-2 px-2">
                  <Sparkles size={12} className="text-purple-500" />
                  <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Use <span className="text-purple-600 font-black">[Nome]</span> para personalizar.</p>
                </div>
              </div>

              <button 
                onClick={() => sendAllMessages('bulk')}
                disabled={isSendingAll || data.clients.length === 0}
                className={cn(
                  "w-full flex items-center justify-center gap-3 py-6 rounded-[1.8rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all",
                  isSendingAll 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-200 hover:shadow-purple-300 active:scale-95"
                )}
              >
                {isSendingAll ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando via API...
                  </>
                ) : (
                  <>
                    <Send size={20} strokeWidth={3} />
                    Disparar para Todas
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : activeTab === 'api' ? (
          <motion.div
            key="api"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 rounded-[3rem] border border-border shadow-sm space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                  <Globe size={32} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-xl leading-tight">Configurar APISend</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Conecte seu WhatsApp</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-3">URL da API</label>
                  <input 
                    type="text"
                    value={apiForm.baseUrl}
                    onChange={(e) => setApiForm({...apiForm, baseUrl: e.target.value})}
                    placeholder="https://sua-api.com"
                    className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-200 outline-none font-bold text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-3">API Key / Token</label>
                  <input 
                    type="password"
                    value={apiForm.token}
                    onChange={(e) => setApiForm({...apiForm, token: e.target.value})}
                    placeholder="Seu Token Secreto"
                    className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-200 outline-none font-bold text-sm"
                  />
                </div>

                <button 
                  onClick={() => {
                    updateApiConfig(apiForm)
                    alert('Configurações de API salvas!')
                  }}
                  className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Zap size={20} strokeWidth={3} fill="currentColor" />
                  Salvar Configuração
                </button>
              </div>

              <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                  <Layout size={20} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="font-black text-blue-800 text-xs uppercase tracking-wider">Como funciona?</h4>
                  <p className="text-blue-700/80 text-[11px] mt-1 leading-relaxed font-medium">
                    Ao configurar a API, o sistema não abrirá mais abas do WhatsApp. 
                    As mensagens serão enviadas silenciosamente em segundo plano, 
                    permitindo disparos rápidos para centenas de clientes.
                  </p>
                </div>
              </div>
            </div>
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
