"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { downloadReport } from "@/lib/api/report"
import { Download } from "lucide-react"

interface ReportMenuProps {
  sessionId: string
}

export function ReportMenu({ sessionId }: ReportMenuProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async (format: "pdf" | "xlsx") => {
    setIsLoading(true)
    setError(null)

    try {
      await downloadReport(sessionId, format)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to download report"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-sm text-red-600">{error}</span>}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownload("pdf")}
          disabled={isLoading}
          className="gap-2"
        >
          <Download size={16} />
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownload("xlsx")}
          disabled={isLoading}
          className="gap-2"
        >
          <Download size={16} />
          Excel
        </Button>
      </div>
    </div>
  )
}
