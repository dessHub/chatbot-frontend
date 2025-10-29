// API Types
export interface ChatRequest {
  session_id: string
  message: string
}

export interface ToolCallResult {
  name: string
  args: Record<string, any>
  result: any
}

export interface ChatResponse {
  session_id: string
  message: string
  agent: string
  intent: string
  tool_calls: ToolCallResult[]
}

// Message Type
export interface Message {
  id: string
  role: "user" | "bot"
  message: string
  timestamp: string // ISO timestamp
  agent?: string
  intent?: string
  tool_calls?: ToolCallResult[]
}

// Session Type
export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: string
}

export interface RespChatSession {
  session_id: string
  title?: string
  chats: Message[]  
  count?: number
}

export interface ChatHistory {
  history: ChatSession[],
  user_id: string,
}

// Auth Type
export interface AuthState {
  token: string | null
  user_id: string | null
}
