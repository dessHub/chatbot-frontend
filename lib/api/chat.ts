import type { ChatRequest, ChatResponse, ChatSession, ChatHistory } from "@/lib/types"
import { getAxiosInstance } from "./client"

export async function postChat(body: ChatRequest): Promise<ChatResponse> {
  const axios = getAxiosInstance()
  const response = await axios.post<ChatResponse>("/chat", body)
  return response.data
}

export async function fetchChatHistory(): Promise<ChatHistory> {
  try {
  const axios = getAxiosInstance()
  const response = await axios.get<ChatHistory>("/history")
  return response.data
  } catch (error) {
    console.error("Error fetching chat history:", error)
    return { history: [], user_id: ""}
  }
}
