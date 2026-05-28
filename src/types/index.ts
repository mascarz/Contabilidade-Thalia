export type Client = {
  id: string
  name: string
  phone: string
  createdAt: string
  observations?: string
}

export type Appointment = {
  id: string
  name: string
  phone: string
  service: string
  amount: number
  date: string
}

export type Transaction = {
  id: string
  type: 'income' | 'expense'
  description: string
  amount: number
  date: string
  category?: string
  clientId?: string
  paymentMethod?: string
  observations?: string
  reconciled?: boolean
}

export type RecurringExpense = {
  id: string
  description: string
  amount: number
  dayOfMonth: number
  category: string
  active: boolean
  lastGenerated?: string
}

export type Fiado = {
  id: string
  clientId: string
  clientName: string
  clientPhone: string
  service: string
  amount: number
  date: string
  status: 'pending' | 'paid'
}

export type MessageConfig = {
  days: number
  enabled: boolean
  template: string
}

export type ApiConfig = {
  baseUrl: string
  token: string
  instance?: string
}

export type AppData = {
  clients: Client[]
  transactions: Transaction[]
  fiados: Fiado[]
  messageConfigs: MessageConfig[]
  recurringExpenses: RecurringExpense[]
  appointments: Appointment[]
  apiConfig?: ApiConfig
}
