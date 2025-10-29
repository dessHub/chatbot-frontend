"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import type { ToolCallResult } from "@/lib/types"

interface ToolCallsPanelProps {
  toolCalls: ToolCallResult[]
}

function truncateResult(result: any, maxLength = 300): { text: string; isTruncated: boolean } {
  const text = typeof result === "string" ? result : JSON.stringify(result, null, 2)
  if (text.length > maxLength) {
    return { text: text.substring(0, maxLength) + "...", isTruncated: true }
  }
  return { text, isTruncated: false }
}

export function ToolCallsPanel({ toolCalls }: ToolCallsPanelProps) {
  const [expandedTools, setExpandedTools] = useState<Set<number>>(new Set())

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedTools)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedTools(newExpanded)
  }

  return (
    <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
      <p className="text-xs font-semibold text-gray-700">Tool Calls</p>
      {toolCalls.map((toolCall, index) => {
        const { text: resultText, isTruncated } = truncateResult(toolCall.result)
        const isExpanded = expandedTools.has(index)

        return (
          <div key={index} className="bg-white p-2 rounded border border-gray-200 text-xs">
            <button
              onClick={() => toggleExpanded(index)}
              className="flex items-center gap-2 w-full text-left font-medium text-gray-700 hover:text-gray-900"
            >
              <ChevronDown size={14} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              {toolCall.name}
            </button>

            {isExpanded && (
              <div className="mt-2 space-y-2 ml-6">
                <div>
                  <p className="text-gray-600 font-medium">Args:</p>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(toolCall.args, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Result:</p>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap break-words">
                    {resultText}
                  </pre>
                  {isTruncated && (
                    <p className="text-gray-500 text-xs mt-1">
                      (Result truncated. Full result available in API response)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
