import axios from "axios"

const API_URL = "https://dca-backend-v3-production.up.railway.app"

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
  localStorage.removeItem("token")
}

export const getCurrentUser = async () => {
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
  try {
    const response = await api.get("/commands")
    return response.data
  } catch (error) {
    console.error("Get commands error:", error)
    throw error
  }
}

export const getCommand = async (id: string) => {
  try {
    const response = await api.get(`/commands/${id}`)
    return response.data
  } catch (error) {
    console.error("Get command error:", error)
    throw error
  }
}

export const createCommand = async (command: any) => {
  try {
    const response = await api.post("/commands", command)
    return response.data
  } catch (error) {
    console.error("Create command error:", error)
    throw error
  }
}

export const updateCommand = async (id: string, command: any) => {
  try {
    const response = await api.put(`/commands/${id}`, command)
    return response.data
  } catch (error) {
    console.error("Update command error:", error)
    throw error
  }
}

export const deleteCommand = async (id: string) => {
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
  try {
    const response = await api.get("/reaction-roles")
    return response.data
  } catch (error) {
    console.error("Get reaction roles error:", error)
    throw error
  }
}

export const getReactionRole = async (id: string) => {
  try {
    const response = await api.get(`/reaction-roles/${id}`)
    return response.data
  } catch (error) {
    console.error("Get reaction role error:", error)
    throw error
  }
}

export const createReactionRole = async (reactionRole: any) => {
  try {
    const response = await api.post("/reaction-roles", reactionRole)
    return response.data
  } catch (error) {
    console.error("Create reaction role error:", error)
    throw error
  }
}

export const updateReactionRole = async (id: string, reactionRole: any) => {
  try {
    const response = await api.put(`/reaction-roles/${id}`, reactionRole)
    return response.data
  } catch (error) {
    console.error("Update reaction role error:", error)
    throw error
  }
}

export const deleteReactionRole = async (id: string) => {
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
  try {
    const response = await api.get("/youtube-feeds")
    return response.data
  } catch (error) {
    console.error("Get YouTube feeds error:", error)
    throw error
  }
}

export const getYouTubeFeed = async (id: string) => {
  try {
    const response = await api.get(`/youtube-feeds/${id}`)
    return response.data
  } catch (error) {
    console.error("Get YouTube feed error:", error)
    throw error
  }
}

export const createYouTubeFeed = async (feed: any) => {
  try {
    const response = await api.post("/youtube-feeds", feed)
    return response.data
  } catch (error) {
    console.error("Create YouTube feed error:", error)
    throw error
  }
}

export const updateYouTubeFeed = async (id: string, feed: any) => {
  try {
    const response = await api.put(`/youtube-feeds/${id}`, feed)
    return response.data
  } catch (error) {
    console.error("Update YouTube feed error:", error)
    throw error
  }
}

export const deleteYouTubeFeed = async (id: string) => {
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
  try {
    const response = await api.get("/logs")
    return response.data
  } catch (error) {
    console.error("Get logs error:", error)
    throw error
  }
}

export const createLog = async (log: any) => {
  try {
    const response = await api.post("/logs", log)
    return response.data
  } catch (error) {
    console.error("Create log error:", error)
    throw error
  }
}

export const updateLog = async (id: string, log: any) => {
  try {
    const response = await api.put(`/logs/${id}`, log)
    return response.data
  } catch (error) {
    console.error("Update log error:", error)
    throw error
  }
}

export const deleteLog = async (id: string) => {
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
  try {
    const response = await api.get("/automod-rules")
    return response.data
  } catch (error) {
    console.error("Get automod rules error:", error)
    throw error
  }
}

export const createAutoModRule = async (rule: any) => {
  try {
    const response = await api.post("/automod-rules", rule)
    return response.data
  } catch (error) {
    console.error("Create automod rule error:", error)
    throw error
  }
}

export const updateAutoModRule = async (id: string, rule: any) => {
  try {
    const response = await api.put(`/automod-rules/${id}`, rule)
    return response.data
  } catch (error) {
    console.error("Update automod rule error:", error)
    throw error
  }
}

export const deleteAutoModRule = async (id: string) => {
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
  try {
    const response = await api.get("/server-stats")
    return response.data
  } catch (error) {
    console.error("Get server stats error:", error)
    throw error
  }
}

export const getBotStatus = async () => {
  try {
    const response = await api.get("/bot-status")
    return response.data
  } catch (error) {
    console.error("Get bot status error:", error)
    throw error
  }
}

export default api
