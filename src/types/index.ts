export type Client = {
  id: string
  name: string
  phone: string
  createdAt: string
  lastService?: string
  lastValue?: number
  observations?: string
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

export type AppData = {
  clients: Client[]
  transactions: Transaction[]
  fiados: Fiado[]
  messageConfigs: MessageConfig[]
}
