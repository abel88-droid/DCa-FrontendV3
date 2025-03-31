// Mock data for the API responses
const mockCommands = [
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
  {
    id: "3",
    trigger: "-warn",
    trigger_type: "Minus",
    response: "User has been warned!",
    roles: "Moderator",
    channels: "mod-commands",
    case_sensitive: false,
  },
  {
    id: "4",
    trigger: "&rank",
    trigger_type: "Prefix",
    response: "Your rank is: {rank}",
    roles: "Everyone",
    channels: "bot-commands",
    case_sensitive: false,
  },
]

const mockReactionRoles = [
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
  {
    id: "3",
    message_id: "9876543210987654",
    channel: "get-roles",
    emoji: "🎨",
    role: "Artist",
  },
]

const mockYouTubeFeeds = [
  {
    id: "1",
    channel_name: "YAGPDB",
    channel_id: "UCt4Kp23GIKCZgZ3uGhsj8Pg",
    notification_channel: "youtube-notifications",
    enabled: true,
    mention_everyone: false,
  },
  {
    id: "2",
    channel_name: "Discord",
    channel_id: "UC4xOVw8GrKjUyzHHZnvLSIQ",
    notification_channel: "discord-updates",
    enabled: true,
    mention_everyone: true,
  },
]

const mockLogs = [
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
  {
    id: "3",
    event_type: "Message Delete",
    channel: "logs",
    enabled: true,
  },
]

const mockAutoModRules = [
  {
    id: "1",
    name: "Anti-Spam",
    trigger_type: "Spam",
    action: "Delete",
    enabled: true,
  },
  {
    id: "2",
    name: "Word Filter",
    trigger_type: "Banned Words",
    action: "Delete + Warn",
    enabled: true,
  },
]

const mockServerStats = {
  total_commands_used: 1234,
  active_users: 89,
  moderation_actions: 23,
  messages_today: 567,
  new_members_week: 12,
  top_channels: [
    { name: "general", messages: 345 },
    { name: "gaming", messages: 234 },
    { name: "music", messages: 123 },
  ],
}

const mockBotStatus = {
  auto_moderation: true,
  welcome_messages: true,
  logging: false,
  uptime: "3 days, 7 hours",
  version: "1.2.3",
  servers: 42,
  commands_registered: 25,
}

// Mock API functions
export const mockLogin = async (username: string, password: string) => {
  // Simulate authentication
  if (username === "admin" && password === "password") {
    const token = "mock-jwt-token"
    localStorage.setItem("token", token)
    return { access_token: token, token_type: "bearer" }
  }
  throw new Error("Invalid credentials")
}

export const mockLogout = () => {
  localStorage.removeItem("token")
}

export const mockGetCurrentUser = async () => {
  return {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    disabled: false,
  }
}

// Commands API
export const mockGetCommands = async () => {
  return mockCommands
}

export const mockGetCommand = async (id: string) => {
  const command = mockCommands.find((c) => c.id === id)
  if (!command) throw new Error("Command not found")
  return command
}

export const mockCreateCommand = async (command: any) => {
  const newCommand = { ...command, id: String(mockCommands.length + 1) }
  mockCommands.push(newCommand)
  return newCommand
}

export const mockUpdateCommand = async (id: string, command: any) => {
  const index = mockCommands.findIndex((c) => c.id === id)
  if (index === -1) throw new Error("Command not found")
  mockCommands[index] = { ...command, id }
  return mockCommands[index]
}

export const mockDeleteCommand = async (id: string) => {
  const index = mockCommands.findIndex((c) => c.id === id)
  if (index === -1) throw new Error("Command not found")
  mockCommands.splice(index, 1)
  return { message: "Command deleted successfully" }
}

// Reaction Roles API
export const mockGetReactionRoles = async () => {
  return mockReactionRoles
}

export const mockGetReactionRole = async (id: string) => {
  const role = mockReactionRoles.find((r) => r.id === id)
  if (!role) throw new Error("Reaction role not found")
  return role
}

export const mockCreateReactionRole = async (reactionRole: any) => {
  const newRole = { ...reactionRole, id: String(mockReactionRoles.length + 1) }
  mockReactionRoles.push(newRole)
  return newRole
}

export const mockUpdateReactionRole = async (id: string, reactionRole: any) => {
  const index = mockReactionRoles.findIndex((r) => r.id === id)
  if (index === -1) throw new Error("Reaction role not found")
  mockReactionRoles[index] = { ...reactionRole, id }
  return mockReactionRoles[index]
}

export const mockDeleteReactionRole = async (id: string) => {
  const index = mockReactionRoles.findIndex((r) => r.id === id)
  if (index === -1) throw new Error("Reaction role not found")
  mockReactionRoles.splice(index, 1)
  return { message: "Reaction role deleted successfully" }
}

// YouTube Feeds API
export const mockGetYouTubeFeeds = async () => {
  return mockYouTubeFeeds
}

export const mockGetYouTubeFeed = async (id: string) => {
  const feed = mockYouTubeFeeds.find((f) => f.id === id)
  if (!feed) throw new Error("YouTube feed not found")
  return feed
}

export const mockCreateYouTubeFeed = async (feed: any) => {
  const newFeed = { ...feed, id: String(mockYouTubeFeeds.length + 1) }
  mockYouTubeFeeds.push(newFeed)
  return newFeed
}

export const mockUpdateYouTubeFeed = async (id: string, feed: any) => {
  const index = mockYouTubeFeeds.findIndex((f) => f.id === id)
  if (index === -1) throw new Error("YouTube feed not found")
  mockYouTubeFeeds[index] = { ...feed, id }
  return mockYouTubeFeeds[index]
}

export const mockDeleteYouTubeFeed = async (id: string) => {
  const index = mockYouTubeFeeds.findIndex((f) => f.id === id)
  if (index === -1) throw new Error("YouTube feed not found")
  mockYouTubeFeeds.splice(index, 1)
  return { message: "YouTube feed deleted successfully" }
}

// Logs API
export const mockGetLogs = async () => {
  return mockLogs
}

export const mockCreateLog = async (log: any) => {
  const newLog = { ...log, id: String(mockLogs.length + 1) }
  mockLogs.push(newLog)
  return newLog
}

export const mockUpdateLog = async (id: string, log: any) => {
  const index = mockLogs.findIndex((l) => l.id === id)
  if (index === -1) throw new Error("Log not found")
  mockLogs[index] = { ...log, id }
  return mockLogs[index]
}

export const mockDeleteLog = async (id: string) => {
  const index = mockLogs.findIndex((l) => l.id === id)
  if (index === -1) throw new Error("Log not found")
  mockLogs.splice(index, 1)
  return { message: "Log deleted successfully" }
}

// AutoMod Rules API
export const mockGetAutoModRules = async () => {
  return mockAutoModRules
}

export const mockCreateAutoModRule = async (rule: any) => {
  const newRule = { ...rule, id: String(mockAutoModRules.length + 1) }
  mockAutoModRules.push(newRule)
  return newRule
}

export const mockUpdateAutoModRule = async (id: string, rule: any) => {
  const index = mockAutoModRules.findIndex((r) => r.id === id)
  if (index === -1) throw new Error("AutoMod rule not found")
  mockAutoModRules[index] = { ...rule, id }
  return mockAutoModRules[index]
}

export const mockDeleteAutoModRule = async (id: string) => {
  const index = mockAutoModRules.findIndex((r) => r.id === id)
  if (index === -1) throw new Error("AutoMod rule not found")
  mockAutoModRules.splice(index, 1)
  return { message: "AutoMod rule deleted successfully" }
}

// Stats API
export const mockGetServerStats = async () => {
  return mockServerStats
}

export const mockGetBotStatus = async () => {
  return mockBotStatus
}

