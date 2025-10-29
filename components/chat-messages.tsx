"use client"

import { useEffect, useRef } from "react"
import { useChatsStore } from "@/lib/store/chats"
import { AgentBadge } from "./agent-badge"
import { ToolCallsPanel } from "./tool-calls-panel"
import type { Message } from "@/lib/types"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw";

export function ChatMessages() {
  const activeSession = useChatsStore((state) => state.getActiveSession())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeSession?.messages])

  if (!activeSession) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No chat selected</p>
          <p className="text-sm">Create a new chat or select one from the sidebar</p>
        </div>
      </div>
    )
  }

  if (activeSession.messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Start a conversation</p>
          <p className="text-sm">Send a message to begin chatting with the bot</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {activeSession.messages.map((message: Message) => (
        <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-full ${
              message.role === "user"
                ? "bg-gray-200 text-gray-800 rounded-lg rounded-tr-none"
                : "w-full bg-gray-50 text-black"
            } p-4`}
          >
            <div className={`"${message.role === "user" ? "text-xs" : "text-lg"} break-words prose prose-sm dark:prose-invert"`}>
              <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              components={{
                pre: ({ node, ...props }) => (
                <div className="overflow-auto">
                  <pre {...props} />
                </div>
                ),
                code: ({ inline, ...props }: { inline?: boolean; [key: string]: any }) => (
                <code className={`${inline ? 'bg-gray-200 dark:bg-gray-800 px-1 rounded' : ''}`} {...props} />
                ),
              }}
              >
              {message.message.replace(/```.*?\n|\n```/g, '')}
              </ReactMarkdown>
            </div>

            {message.role === "bot" && (
              <div className="flex justify-end mt-3 space-y-2">
                {/* {message.agent && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Agent:</span>
                    <AgentBadge agent={message.agent} />
                  </div>
                )} */}
                {/* {message.intent && (
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Intent:</span> {message.intent}
                  </p>
                )}
                {message.tool_calls && message.tool_calls.length > 0 && (
                  <ToolCallsPanel toolCalls={message.tool_calls} />
                )} */}
                <div className="text-xs mt-2 opacity-70">{
              new Date(message.timestamp).toLocaleDateString()} {" "}
              {
              new Date(message.timestamp).toLocaleTimeString()
            }</div>

              </div>
            )}

            
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
