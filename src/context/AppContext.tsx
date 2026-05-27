'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AppData, Client, Transaction, Fiado, MessageConfig } from '@/types'

type AppContextType = {
  data: AppData
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  addFiado: (fiado: Omit<Fiado, 'id'>) => void
  updateFiado: (id: string, fiado: Partial<Fiado>) => void
  deleteFiado: (id: string) => void
  updateMessageConfig: (days: number, config: Partial<MessageConfig>) => void
  isLoading: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const INITIAL_DATA: AppData = {
  clients: [],
  transactions: [],
  fiados: [],
  messageConfigs: [
    { days: 7, enabled: true, template: 'Olá [Nome], já faz 7 dias desde seu último atendimento no Studio Thalia Abdo 💕 Agende novamente seu horário.' },
    { days: 14, enabled: true, template: 'Olá [Nome], saudades! Já faz 14 dias que você não vem ao Studio Thalia Abdo. Vamos agendar um horário?' },
    { days: 30, enabled: true, template: 'Oi [Nome], tudo bem? Percebemos que faz um mês do seu último serviço. Que tal renovar o visual no Studio Thalia Abdo? ✨' },
  ],
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('studio_thalia_data')
    if (saved) {
      try {
        setData(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved data', e)
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('studio_thalia_data', JSON.stringify(data))
    }
  }, [data, isLoading])

  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setData(prev => ({ ...prev, clients: [newClient, ...prev.clients] }))
  }

  const updateClient = (id: string, updates: Partial<Client>) => {
    setData(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === id ? { ...c, ...updates } : c)
    }))
  }

  const deleteClient = (id: string) => {
    setData(prev => ({
      ...prev,
      clients: prev.clients.filter(c => c.id !== id)
    }))
  }

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
    }
    setData(prev => ({ ...prev, transactions: [newTransaction, ...prev.transactions] }))
  }

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
    }))
  }

  const deleteTransaction = (id: string) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }))
  }

  const addFiado = (fiado: Omit<Fiado, 'id'>) => {
    const newFiado: Fiado = {
      ...fiado,
      id: crypto.randomUUID(),
    }
    setData(prev => ({ ...prev, fiados: [newFiado, ...prev.fiados] }))
  }

  const updateFiado = (id: string, updates: Partial<Fiado>) => {
    setData(prev => ({
      ...prev,
      fiados: prev.fiados.map(f => f.id === id ? { ...f, ...updates } : f)
    }))
  }

  const deleteFiado = (id: string) => {
    setData(prev => ({
      ...prev,
      fiados: prev.fiados.filter(f => f.id !== id)
    }))
  }

  const updateMessageConfig = (days: number, updates: Partial<MessageConfig>) => {
    setData(prev => ({
      ...prev,
      messageConfigs: prev.messageConfigs.map(m => m.days === days ? { ...m, ...updates } : m)
    }))
  }

  return (
    <AppContext.Provider value={{
      data,
      addClient,
      updateClient,
      deleteClient,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addFiado,
      updateFiado,
      deleteFiado,
      updateMessageConfig,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
