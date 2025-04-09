import axios from "axios"

// Change the API_URL to your Railway deployment URL
// This should be the public URL of your Railway deployment, not the internal 0.0.0.0:8000
const API_URL = "https://dca-backend-v3-production.up.railway.app"

// Detect if we're in a preview environment - ONLY use mock data in preview
const isPreviewEnvironment = () => {
  if (typeof window === "undefined") return false

  // Only consider it a preview if it's on localhost or a Vercel preview URL (not production)
  // Vercel preview URLs contain 'vercel.app' but also have additional identifiers
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

// Create axios instance with timeout and better error handling
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 second timeout
  withCredentials: true, // Add credentials for CORS
})

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log(`Making request to: ${config.baseURL}${config.url}`)
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error("Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`Received response from: ${response.config.url}`, response.status)
    return response
  },
  (error) => {
    console.error("API Error:", error)
    if (error.response) {
      console.error("Response status:", error.response.status)
      console.error("Response data:", error.response.data)

      if (error.response.status === 401) {
        // Unauthorized - redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("token")
          window.location.href = "/login"
        }
      }
    } else if (error.request) {
      console.error("No response received:", error.request)
    } else {
      console.error("Error setting up request:", error.message)
    }
    return Promise.reject(error)
  },
)

// Mock data for preview environment only
const mockData = {
  token: "mock-token-12345",
  commands: [
    {
      id: "1",
      trigger: "!help",
      trigger_type: "Command",
      response: "Here are the available commands: !help, !rules, !welcome",
      roles: "Everyone",
      channels: "All",
      case_sensitive: false,
    },
    {
      id: "2",
      trigger: "!rules",
      trigger_type: "Command",
      response: "1. Be respectful\n2. No spamming\n3. Follow Discord TOS",
      roles: "Everyone",
      channels: "All",
      case_sensitive: false,
    },
  ],
  reactionRoles: [
    {
      id: "1",
      message_id: "1234567890123456",
      channel: "roles",
      emoji: "🎮",
      role: "Gamer",
    },
    {
      id: "2",
      message_id: "1234567890123456",
      channel: "roles",
      emoji: "🎵",
      role: "Music Lover",
    },
  ],
  youtubeFeeds: [
    {
      id: "1",
      channel_name: "YAGPDB",
      channel_id: "UCt4Kp23GIKCZgZ3uGhsj8Pg",
      notification_channel: "youtube-notifications",
      enabled: true,
      mention_everyone: false,
    },
  ],
  logs: [
    {
      id: "1",
      event_type: "Member Join",
      channel: "logs",
      enabled: true,
    },
    {
      id: "2",
      event_type: "Member Leave",
      channel: "logs",
      enabled: true,
    },
  ],
  automodRules: [
    {
      id: "1",
      name: "Anti-Spam",
      trigger_type: "Spam",
      action: "Delete",
      enabled: true,
    },
  ],
  serverStats: {
    total_commands_used: 1234,
    active_users: 89,
    moderation_actions: 23,
    messages_today: 567,
    new_members_week: 12,
  },
  botStatus: {
    auto_moderation: true,
    welcome_messages: true,
    logging: false,
    uptime: "3 days, 7 hours",
    version: "1.2.3",
    servers: 42,
  },
}

// Auth API
export const login = async (username: string, password: string) => {
  try {
    // Check if we're in a preview environment
    if (isPreviewEnvironment()) {
      console.log("Preview environment detected, using mock login")

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Check credentials (for demo purposes)
      if (username === "admin" && password === "password") {
        localStorage.setItem("token", mockData.token)
        return { access_token: mockData.token, token_type: "bearer" }
      } else {
        throw new Error("Invalid username or password")
      }
    }

    console.log("Attempting login to:", `${API_URL}/token`)

    // Try with URLSearchParams instead of FormData
    const params = new URLSearchParams()
    params.append("username", username)
    params.append("password", password)

    // Log params for debugging
    console.log("Login params:", {
      username: username,
      password: "********", // Don't log actual password
    })

    // Try with axios
    const response = await axios.post(`${API_URL}/token`, params, {
      timeout: 15000, // 15 second timeout
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      withCredentials: true,
    })

    console.log("Login successful with axios")
    localStorage.setItem("token", response.data.access_token)
    return response.data
  } catch (error: any) {
    console.error("Login error details:", error)

    // If it's a network error, provide a more helpful message
    if (error.message === "Network Error") {
      console.error("Network error details:", error)
      throw new Error(
        `Cannot connect to the server at ${API_URL}. Please check your internet connection or try again later.`,
      )
    }

    throw error
  }
}

export const logout = () => {
  localStorage.removeItem("token")
}

export const getCurrentUser = async () => {
  // Only use mock data in preview environment
  if (isPreviewEnvironment()) {
    console.log("Using mock user data in preview environment")
    return {
      id: "1",
      username: "admin",
      email: "admin@example.com",
    }
  }

  try {
    const response = await api.get("/users/me")
    return response.data
  } catch (error) {
    console.error("Get current user error:", error)
    throw error
  }
}

// Commands API
export const getCommands = async () => {
  // Only use mock data in preview environment
  if (isPreviewEnvironment()) {
    console.log("Using mock commands data in preview environment")
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockData.commands
  }

  try {
    const response = await api.get("/commands")
    return response.data
  } catch (error) {
    console.error("Get commands error:", error)
    throw error
  }
}

export const getCommand = async (id: string) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const command = mockData.commands.find((cmd) => cmd.id === id)
    if (!command) throw new Error("Command not found")
    return command
  }

  try {
    const response = await api.get(`/commands/${id}`)
    return response.data
  } catch (error) {
    console.error("Get command error:", error)
    throw error
  }
}

export const createCommand = async (command: any) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newCommand = { ...command, id: Date.now().toString() }
    mockData.commands.push(newCommand)
    return newCommand
  }

  try {
    const response = await api.post("/commands", command)
    return response.data
  } catch (error) {
    console.error("Create command error:", error)
    throw error
  }
}

export const updateCommand = async (id: string, command: any) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockData.commands.findIndex((cmd) => cmd.id === id)
    if (index === -1) throw new Error("Command not found")
    mockData.commands[index] = { ...command, id }
    return mockData.commands[index]
  }

  try {
    const response = await api.put(`/commands/${id}`, command)
    return response.data
  } catch (error) {
    console.error("Update command error:", error)
    throw error
  }
}

export const deleteCommand = async (id: string) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockData.commands.findIndex((cmd) => cmd.id === id)
    if (index === -1) throw new Error("Command not found")
    mockData.commands.splice(index, 1)
    return { message: "Command deleted successfully" }
  }

  try {
    const response = await api.delete(`/commands/${id}`)
    return response.data
  } catch (error) {
    console.error("Delete command error:", error)
    throw error
  }
}

// Reaction Roles API
export const getReactionRoles = async () => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockData.reactionRoles
  }

  try {
    const response = await api.get("/reaction-roles")
    return response.data
  } catch (error) {
    console.error("Get reaction roles error:", error)
    throw error
  }
}

export const getReactionRole = async (id: string) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const role = mockData.reactionRoles.find((r) => r.id === id)
    if (!role) throw new Error("Reaction role not found")
    return role
  }

  try {
    const response = await api.get(`/reaction-roles/${id}`)
    return response.data
  } catch (error) {
    console.error("Get reaction role error:", error)
    throw error
  }
}

export const createReactionRole = async (reactionRole: any) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newRole = { ...reactionRole, id: Date.now().toString() }
    mockData.reactionRoles.push(newRole)
    return newRole
  }

  try {
    const response = await api.post("/reaction-roles", reactionRole)
    return response.data
  } catch (error) {
    console.error("Create reaction role error:", error)
    throw error
  }
}

export const updateReactionRole = async (id: string, reactionRole: any) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockData.reactionRoles.findIndex((r) => r.id === id)
    if (index === -1) throw new Error("Reaction role not found")
    mockData.reactionRoles[index] = { ...reactionRole, id }
    return mockData.reactionRoles[index]
  }

  try {
    const response = await api.put(`/reaction-roles/${id}`, reactionRole)
    return response.data
  } catch (error) {
    console.error("Update reaction role error:", error)
    throw error
  }
}

export const deleteReactionRole = async (id: string) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockData.reactionRoles.findIndex((r) => r.id === id)
    if (index === -1) throw new Error("Reaction role not found")
    mockData.reactionRoles.splice(index, 1)
    return { message: "Reaction role deleted successfully" }
  }

  try {
    const response = await api.delete(`/reaction-roles/${id}`)
    return response.data
  } catch (error) {
    console.error("Delete reaction role error:", error)
    throw error
  }
}

// YouTube Feeds API
export const getYouTubeFeeds = async () => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockData.youtubeFeeds
  }

  try {
    const response = await api.get("/youtube-feeds")
    return response.data
  } catch (error) {
    console.error("Get YouTube feeds error:", error)
    throw error
  }
}

export const getYouTubeFeed = async (id: string) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const feed = mockData.youtubeFeeds.find((f) => f.id === id)
    if (!feed) throw new Error("YouTube feed not found")
    return feed
  }

  try {
    const response = await api.get(`/youtube-feeds/${id}`)
    return response.data
  } catch (error) {
    console.error("Get YouTube feed error:", error)
    throw error
  }
}

export const createYouTubeFeed = async (feed: any) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newFeed = { ...feed, id: Date.now().toString() }
    mockData.youtubeFeeds.push(newFeed)
    return newFeed
  }

  try {
    const response = await api.post("/youtube-feeds", feed)
    return response.data
  } catch (error) {
    console.error("Create YouTube feed error:", error)
    throw error
  }
}

export const updateYouTubeFeed = async (id: string, feed: any) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockData.youtubeFeeds.findIndex((f) => f.id === id)
    if (index === -1) throw new Error("YouTube feed not found")
    mockData.youtubeFeeds[index] = { ...feed, id }
    return mockData.youtubeFeeds[index]
  }

  try {
    const response = await api.put(`/youtube-feeds/${id}`, feed)
    return response.data
  } catch (error) {
    console.error("Update YouTube feed error:", error)
    throw error
  }
}

export const deleteYouTubeFeed = async (id: string) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockData.youtubeFeeds.findIndex((f) => f.id === id)
    if (index === -1) throw new Error("YouTube feed not found")
    mockData.youtubeFeeds.splice(index, 1)
    return { message: "YouTube feed deleted successfully" }
  }

  try {
    const response = await api.delete(`/youtube-feeds/${id}`)
    return response.data
  } catch (error) {
    console.error("Delete YouTube feed error:", error)
    throw error
  }
}

// Logs API
export const getLogs = async () => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockData.logs
  }

  try {
    const response = await api.get("/logs")
    return response.data
  } catch (error) {
    console.error("Get logs error:", error)
    throw error
  }
}

export const createLog = async (log: any) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newLog = { ...log, id: Date.now().toString() }
    mockData.logs.push(newLog)
    return newLog
  }

  try {
    const response = await api.post("/logs", log)
    return response.data
  } catch (error) {
    console.error("Create log error:", error)
    throw error
  }
}

export const updateLog = async (id: string, log: any) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockData.logs.findIndex((l) => l.id === id)
    if (index === -1) throw new Error("Log not found")
    mockData.logs[index] = { ...log, id }
    return mockData.logs[index]
  }

  try {
    const response = await api.put(`/logs/${id}`, log)
    return response.data
  } catch (error) {
    console.error("Update log error:", error)
    throw error
  }
}

export const deleteLog = async (id: string) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockData.logs.findIndex((l) => l.id === id)
    if (index === -1) throw new Error("Log not found")
    mockData.logs.splice(index, 1)
    return { message: "Log deleted successfully" }
  }

  try {
    const response = await api.delete(`/logs/${id}`)
    return response.data
  } catch (error) {
    console.error("Delete log error:", error)
    throw error
  }
}

// AutoMod Rules API
export const getAutoModRules = async () => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockData.automodRules
  }

  try {
    const response = await api.get("/automod-rules")
    return response.data
  } catch (error) {
    console.error("Get automod rules error:", error)
    throw error
  }
}

export const createAutoModRule = async (rule: any) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newRule = { ...rule, id: Date.now().toString() }
    mockData.automodRules.push(newRule)
    return newRule
  }

  try {
    const response = await api.post("/automod-rules", rule)
    return response.data
  } catch (error) {
    console.error("Create automod rule error:", error)
    throw error
  }
}

export const updateAutoModRule = async (id: string, rule: any) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockData.automodRules.findIndex((r) => r.id === id)
    if (index === -1) throw new Error("AutoMod rule not found")
    mockData.automodRules[index] = { ...rule, id }
    return mockData.automodRules[index]
  }

  try {
    const response = await api.put(`/automod-rules/${id}`, rule)
    return response.data
  } catch (error) {
    console.error("Update automod rule error:", error)
    throw error
  }
}

export const deleteAutoModRule = async (id: string) => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockData.automodRules.findIndex((r) => r.id === id)
    if (index === -1) throw new Error("AutoMod rule not found")
    mockData.automodRules.splice(index, 1)
    return { message: "AutoMod rule deleted successfully" }
  }

  try {
    const response = await api.delete(`/automod-rules/${id}`)
    return response.data
  } catch (error) {
    console.error("Delete automod rule error:", error)
    throw error
  }
}

// Stats API
export const getServerStats = async () => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockData.serverStats
  }

  try {
    const response = await api.get("/server-stats")
    return response.data
  } catch (error) {
    console.error("Get server stats error:", error)
    throw error
  }
}

export const getBotStatus = async () => {
  if (isPreviewEnvironment()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockData.botStatus
  }

  try {
    const response = await api.get("/bot-status")
    return response.data
  } catch (error) {
    console.error("Get bot status error:", error)
    throw error
  }
}

export default api
      
