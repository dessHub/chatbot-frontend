import { getAxiosInstance } from "./client"

export async function getReportUrl(sessionId: string, format: "pdf" | "xlsx"): Promise<string> {
  const axios = getAxiosInstance()
  const baseURL = axios.defaults.baseURL || ""
  return `${baseURL}/report/${sessionId}?format=${format}`
}

export async function downloadReport(sessionId: string, format: "pdf" | "xlsx"): Promise<void> {
  const axios = getAxiosInstance()
  const response = await axios.get(`/report/${sessionId}?format=${format}`, {
    responseType: "blob",
  })

  const filename = `report-${sessionId}.${format === "pdf" ? "pdf" : "xlsx"}`
  const url = window.URL.createObjectURL(response.data)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
