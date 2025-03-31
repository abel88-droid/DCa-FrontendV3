import axios from "axios"
import * as mockApi from "./mock-api"

const API_URL = "https://dca-backend-v3-production.up.railway.app/"

// Determine if we're in a preview environment
const isPreviewEnvironment =
  typeof window !== "undefined" &&
  (window.location.hostname.includes("vusercontent.com") || window.location.hostname.includes("vercel.app"))

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Auth API
export const login = async (username: string, password: string) => {
  if (isPreviewEnvironment) {
    return mockApi.mockLogin(username, password)
  }

  try {
    const formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)

    const response = await axios.post(`${API_URL}/token`, formData)
    localStorage.setItem("token", response.data.access_token)
    return response.data
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export const logout = () => {
  if (isPreviewEnvironment) {
    return mockApi.mockLogout()
  }
  localStorage.removeItem("token")
}

export const getCurrentUser = async () => {
  if (isPreviewEnvironment) {
    return mockApi.mockGetCurrentUser()
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
  if (isPreviewEnvironment) {
    return mockApi.mockGetCommands()
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
  if (isPreviewEnvironment) {
    return mockApi.mockGetCommand(id)
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
  if (isPreviewEnvironment) {
    return mockApi.mockCreateCommand(command)
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
  if (isPreviewEnvironment) {
    return mockApi.mockUpdateCommand(id, command)
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
  if (isPreviewEnvironment) {
    return mockApi.mockDeleteCommand(id)
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
  if (isPreviewEnvironment) {
    return mockApi.mockGetReactionRoles()
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
  if (isPreviewEnvironment) {
    return mockApi.mockGetReactionRole(id)
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
  if (isPreviewEnvironment) {
    return mockApi.mockCreateReactionRole(reactionRole)
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
  if (isPreviewEnvironment) {
    return mockApi.mockUpdateReactionRole(id, reactionRole)
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
  if (isPreviewEnvironment) {
    return mockApi.mockDeleteReactionRole(id)
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
  if (isPreviewEnvironment) {
    return mockApi.mockGetYouTubeFeeds()
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
  if (isPreviewEnvironment) {
    return mockApi.mockGetYouTubeFeed(id)
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
  if (isPreviewEnvironment) {
    return mockApi.mockCreateYouTubeFeed(feed)
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
  if (isPreviewEnvironment) {
    return mockApi.mockUpdateYouTubeFeed(id, feed)
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
  if (isPreviewEnvironment) {
    return mockApi.mockDeleteYouTubeFeed(id)
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
  if (isPreviewEnvironment) {
    return mockApi.mockGetLogs()
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
  if (isPreviewEnvironment) {
    return mockApi.mockCreateLog(log)
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
  if (isPreviewEnvironment) {
    return mockApi.mockUpdateLog(id, log)
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
  if (isPreviewEnvironment) {
    return mockApi.mockDeleteLog(id)
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
  if (isPreviewEnvironment) {
    return mockApi.mockGetAutoModRules()
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
  if (isPreviewEnvironment) {
    return mockApi.mockCreateAutoModRule(rule)
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
  if (isPreviewEnvironment) {
    return mockApi.mockUpdateAutoModRule(id, rule)
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
  if (isPreviewEnvironment) {
    return mockApi.mockDeleteAutoModRule(id)
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
  if (isPreviewEnvironment) {
    return mockApi.mockGetServerStats()
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
  if (isPreviewEnvironment) {
    return mockApi.mockGetBotStatus()
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

