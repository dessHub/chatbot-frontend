"use client"

interface AgentBadgeProps {
  agent: string
}

const agentColors: Record<string, string> = {
  inventory: "bg-blue-100 text-blue-800",
  sales: "bg-green-100 text-green-800",
  customers: "bg-purple-100 text-purple-800",
  general: "bg-gray-100 text-gray-800",
}

export function AgentBadge({ agent }: AgentBadgeProps) {
  const colorClass = agentColors[agent.toLowerCase()] || agentColors.general

  return <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${colorClass}`}>{agent}</span>
}
