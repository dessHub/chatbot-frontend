"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth"
import { initializeAxios } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format"
    if (!password.trim()) newErrors.password = "Password is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!apiBaseUrl) {
        setErrors({
          submit: "API Base URL is not configured. Please set NEXT_PUBLIC_API_BASE_URL environment variable.",
        })
        return
      }

      const response = await fetch(`${apiBaseUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "resource" :"user:login",
          "data" :{
            "email": email,
            "password": password,
            "remember_me": true,
            "logout_similar": true,
                "device": {
                    "name": "Postman",
                    "os": "Windows 10",
                    "version": "1.2.4",
                    "width": "1920",
                    "height": "1080"
                }
          },
          "metadata":{
            "service": "puma"
          }
        }),
      })
      console.log('Login response status:', response);
      const resp = await response.json();
      console.log('Login response data:', resp);

      if (resp.error) {
        setErrors({ submit: resp.error?.msg || "Login failed. Please check your credentials." })
        return
      }

      const { auth_token, user } = resp.result;
      console.log('Extracted token and user:', auth_token, user);
      const user_id = user._id;
      const token = auth_token;

      // Initialize Axios with credentials
      initializeAxios(apiBaseUrl, token, user_id)

      // Store auth state
      login(token, user_id)

      // Redirect to chats
      router.push("/chats")
    } catch (error) {
      setErrors({ submit: "Failed to login. Please check your connection." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Chatbot Login</CardTitle>
          <CardDescription>Enter your email and password to access the chatbot</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
