"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command, AlertCircle, Info, Bug } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { login } from "@/lib/api-client"

// Detect if we're in a preview environment
const isPreviewEnvironment = () => {
  if (typeof window === "undefined") return false

  // Only consider it a preview if it's on localhost or a Vercel preview URL (not production)
  const hostname = window.location.hostname

  // Local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return true
  }

  // Vercel preview deployments have patterns like:
  // project-git-branch-username.vercel.app or project-randomstring.vercel.app
  // But your production URL is just dca-frontend-v3.vercel.app
  if (hostname.includes("vercel.app")) {
    // If it's exactly your production domain, it's not a preview
    if (hostname === "dca-frontend-v3.vercel.app") {
      return false
    }
    // Otherwise it's a preview deployment
    return true
  }

  // Any other domain is considered production
  return false
}

export default function Login() {
  const router = useRouter()
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [debugInfo, setDebugInfo] = React.useState<string | null>(null)
  const [isPreview, setIsPreview] = React.useState(false)
  const [showDebug, setShowDebug] = React.useState(false)
  const [apiUrl, setApiUrl] = React.useState("")

  // Check if we're in a preview environment
  React.useEffect(() => {
    setIsPreview(isPreviewEnvironment())

    // Get the API URL from the environment
    import("@/lib/api-client").then((module) => {
      setApiUrl(module.default.defaults.baseURL || "Not set")
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setDebugInfo(null)
    setIsLoading(true)

    try {
      console.log("Login attempt with username:", username)
      await login(username, password)
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)

      // Extract the most helpful error message
      if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else if (err.message) {
        setError(err.message)
      } else {
        setError("Login failed. Please check your credentials and try again.")
      }

      // Set debug info
      setDebugInfo(
        `Error type: ${err.name || "Unknown"}, Message: ${err.message || "No message"}, Status: ${err.response?.status || "No status"}`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  // For development/debugging - direct login option
  const handleDirectLogin = async () => {
    try {
      setIsLoading(true)
      setError("")
      setDebugInfo(null)

      // Create a token manually
      const mockToken = "mock-token-" + Date.now()
      localStorage.setItem("token", mockToken)

      // Navigate to dashboard
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Direct login error:", err)
      setError("Direct login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="rounded-full bg-primary p-2">
              <Command className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Bot Dashboard</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access the dashboard</CardDescription>

          {isPreview && (
            <Alert className="mt-4 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700">
                <strong>Preview Mode:</strong> Use username <code className="bg-blue-100 px-1 rounded">admin</code> and
                password <code className="bg-blue-100 px-1 rounded">password</code> to log in.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {debugInfo && (
              <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs font-mono break-all">{debugInfo}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Debug section */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs text-gray-500 flex items-center gap-1"
              >
                <Bug className="h-3 w-3" />
                {showDebug ? "Hide Debug Info" : "Show Debug Info"}
              </button>

              {showDebug && (
                <div className="mt-2 p-2 bg-gray-100 rounded-md text-xs font-mono">
                  <div>API URL: {apiUrl}</div>
                  <div>Preview Mode: {isPreview ? "Yes" : "No"}</div>
                  <div>Hostname: {typeof window !== "undefined" ? window.location.hostname : "SSR"}</div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            {isPreview && (
              <Button
                type="button"
                variant="outline"
                className="w-full text-sm"
                onClick={handleDirectLogin}
                disabled={isLoading}
              >
                Skip Login (Preview Mode)
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

