'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AppData, Client, Transaction, Fiado, MessageConfig, RecurringExpense, ApiConfig } from '@/types'
import { isSameMonth, parseISO, setDate, format } from 'date-fns'
import { generateId } from '@/lib/utils'

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
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id' | 'active'>) => void
  updateRecurringExpense: (id: string, updates: Partial<RecurringExpense>) => void
  deleteRecurringExpense: (id: string) => void
  updateMessageConfig: (days: number, config: Partial<MessageConfig>) => void
  updateApiConfig: (config: ApiConfig) => void
  sendMessageViaApi: (phone: string, message: string) => Promise<boolean>
  toggleReconciliation: (transactionId: string) => void
  isLoading: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const INITIAL_DATA: AppData = {
  clients: [],
  transactions: [],
  fiados: [],
  recurringExpenses: [],
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
        const parsed = JSON.parse(saved)
        setData({
          ...INITIAL_DATA,
          ...parsed,
          // Garante que campos de array existam mesmo em dados antigos
          clients: parsed.clients || [],
          transactions: parsed.transactions || [],
          fiados: parsed.fiados || [],
          recurringExpenses: parsed.recurringExpenses || [],
          messageConfigs: parsed.messageConfigs || INITIAL_DATA.messageConfigs
        })
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

  const checkRecurringExpenses = useCallback(() => {
    const today = new Date()
    const newTransactions: Transaction[] = []
    const expenses = data.recurringExpenses || []
    
    const updatedRecurring = expenses.map(expense => {
      if (!expense.active) return expense

      const lastGenerated = expense.lastGenerated ? parseISO(expense.lastGenerated) : null
      const alreadyGeneratedThisMonth = lastGenerated && isSameMonth(lastGenerated, today)

      if (!alreadyGeneratedThisMonth && today.getDate() >= expense.dayOfMonth) {
        const transactionDate = setDate(today, expense.dayOfMonth)
        newTransactions.push({
          id: generateId(),
          type: 'expense',
          description: `[RECORRENTE] ${expense.description}`,
          amount: expense.amount,
          date: transactionDate.toISOString(),
          category: expense.category,
          reconciled: false
        })
        return { ...expense, lastGenerated: today.toISOString() }
      }
      return expense
    })

    if (newTransactions.length > 0) {
      setData(prev => ({
        ...prev,
        transactions: [...newTransactions, ...prev.transactions],
        recurringExpenses: updatedRecurring
      }))
    }
  }, [data.recurringExpenses])

  useEffect(() => {
    if (!isLoading) {
      checkRecurringExpenses()
    }
  }, [isLoading, checkRecurringExpenses])

  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: generateId(),
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
      id: generateId(),
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
      id: generateId(),
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

  const addRecurringExpense = (expense: Omit<RecurringExpense, 'id' | 'active'>) => {
    const newExpense: RecurringExpense = {
      ...expense,
      id: generateId(),
      active: true,
    }
    setData(prev => ({ ...prev, recurringExpenses: [newExpense, ...prev.recurringExpenses] }))
  }

  const updateRecurringExpense = (id: string, updates: Partial<RecurringExpense>) => {
    setData(prev => ({
      ...prev,
      recurringExpenses: prev.recurringExpenses.map(e => e.id === id ? { ...e, ...updates } : e)
    }))
  }

  const deleteRecurringExpense = (id: string) => {
    setData(prev => ({
      ...prev,
      recurringExpenses: prev.recurringExpenses.filter(e => e.id !== id)
    }))
  }

  const updateMessageConfig = (days: number, updates: Partial<MessageConfig>) => {
    setData(prev => ({
      ...prev,
      messageConfigs: prev.messageConfigs.map(m => m.days === days ? { ...m, ...updates } : m)
    }))
  }

  const updateApiConfig = (apiConfig: ApiConfig) => {
    setData(prev => ({ ...prev, apiConfig }))
  }

  const sendMessageViaApi = async (phone: string, message: string) => {
    if (!data.apiConfig?.baseUrl) {
      console.error('API Base URL not configured')
      return false
    }

    const cleanPhone = phone.replace(/\D/g, '')
    // Exemplo de integração genérica (estilo Evolution API ou similar)
    try {
      const response = await fetch(`${data.apiConfig.baseUrl}/message/sendText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': data.apiConfig.token || ''
        },
        body: JSON.stringify({
          number: `55${cleanPhone}`,
          text: message,
          // Adicione outros campos conforme necessário pela API do usuário
        })
      })
      return response.ok
    } catch (error) {
      console.error('Error sending message via API:', error)
      return false
    }
  }

  const toggleReconciliation = (transactionId: string) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => 
        t.id === transactionId ? { ...t, reconciled: !t.reconciled } : t
      )
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
      addRecurringExpense,
        updateRecurringExpense,
        deleteRecurringExpense,
        updateMessageConfig,
        updateApiConfig,
        sendMessageViaApi,
        toggleReconciliation,
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
