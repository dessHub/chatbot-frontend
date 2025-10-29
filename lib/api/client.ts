import axios, { type AxiosInstance } from "axios"

let axiosInstance: AxiosInstance | null = null

export function initializeAxios(baseURL: string, token: string, user_id: string): AxiosInstance {
  axiosInstance = axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`,
      "userid": user_id,
    },
  })

  // Add response interceptor for error handling
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid - redirect to login
        window.location.href = "/"
      }
      return Promise.reject(error)
    },
  )

  return axiosInstance
}

export function getAxiosInstance(): AxiosInstance {
  if (!axiosInstance) {
    throw new Error("Axios not initialized. Call initializeAxios first.")
  }
  return axiosInstance
}

export function updateAxiosHeaders(token: string, user_id: string): void {
  if (axiosInstance) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`
    axiosInstance.defaults.headers.common["userid"] = user_id
  }
}
