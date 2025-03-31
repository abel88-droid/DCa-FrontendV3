"use client"

import * as React from "react"
import {
  Bell,
  ChevronDown,
  Command,
  Home,
  MessageSquare,
  PlusCircle,
  Settings,
  Shield,
  Users,
  Youtube,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CustomCommands } from "@/components/custom-commands"
import { ReactionRoles } from "@/components/reaction-roles"
import { YouTubeFeeds } from "@/components/youtube-feeds"
import { LoggingConfig } from "@/components/logging-config"
import { AutoModeration } from "@/components/auto-moderation"
import { getServerStats, getBotStatus, logout } from "@/lib/api-client"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()
  const [activeSection, setActiveSection] = React.useState("home")
  const [serverStats, setServerStats] = React.useState<any>(null)
  const [botStatus, setBotStatus] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  const user = "{user}"
  const server = "{server}"
  const count = "{count}"

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError("")

      try {
        const [statsData, statusData] = await Promise.all([getServerStats(), getBotStatus()])
        setServerStats(statsData)
        setBotStatus(statusData)
      } catch (err) {
        console.error("Failed to load dashboard data:", err)
        setError("Failed to load dashboard data. Using fallback data.")

        // Set fallback data
        setServerStats({
          total_commands_used: 1234,
          active_users: 89,
          moderation_actions: 23,
          messages_today: 567,
          new_members_week: 12,
        })

        setBotStatus({
          auto_moderation: true,
          welcome_messages: true,
          logging: false,
          uptime: "3 days, 7 hours",
          version: "1.2.3",
          servers: 42,
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (activeSection === "home") {
      fetchData()
    }
  }, [activeSection])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:flex-row">
        <div className="border-r bg-background min-h-screen w-64 hidden md:block">
          <div className="flex h-14 items-center border-b px-4">
            <Button variant="outline" size="sm" className="h-8 w-full justify-start gap-1">
              <Command className="h-4 w-4" />
              <span>BotCommand</span>
              <Badge className="ml-auto" variant="secondary">
                Online
              </Badge>
            </Button>
          </div>
          <nav className="grid gap-1 px-2 pt-2">
            <Button
              variant={activeSection === "home" ? "default" : "ghost"}
              className="justify-start gap-2"
              onClick={() => setActiveSection("home")}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
            <Button
              variant={activeSection === "commands" ? "default" : "ghost"}
              className="justify-start gap-2"
              onClick={() => setActiveSection("commands")}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Commands</span>
            </Button>
            <Button
              variant={activeSection === "reaction-roles" ? "default" : "ghost"}
              className="justify-start gap-2"
              onClick={() => setActiveSection("reaction-roles")}
            >
              <Users className="h-4 w-4" />
              <span>Reaction Roles</span>
            </Button>
            <Button
              variant={activeSection === "youtube-feeds" ? "default" : "ghost"}
              className="justify-start gap-2"
              onClick={() => setActiveSection("youtube-feeds")}
            >
              <Youtube className="h-4 w-4" />
              <span>YouTube Feeds</span>
            </Button>
            <Button
              variant={activeSection === "automod" ? "default" : "ghost"}
              className="justify-start gap-2"
              onClick={() => setActiveSection("automod")}
            >
              <Shield className="h-4 w-4" />
              <span>Auto-Moderation</span>
            </Button>
            <Button
              variant={activeSection === "logging" ? "default" : "ghost"}
              className="justify-start gap-2"
              onClick={() => setActiveSection("logging")}
            >
              <Bell className="h-4 w-4" />
              <span>Logging</span>
            </Button>
            <Button
              variant={activeSection === "settings" ? "default" : "ghost"}
              className="justify-start gap-2"
              onClick={() => setActiveSection("settings")}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          </nav>
          <div className="mt-4 px-2">
            <div className="rounded-lg border bg-card p-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Bot Avatar" />
                  <AvatarFallback>BC</AvatarFallback>
                </Avatar>
                <div className="grid gap-0.5 text-sm">
                  <div className="font-medium">BotCommand</div>
                  <div className="text-xs text-muted-foreground">
                    {botStatus ? `Serving ${botStatus.servers} servers` : "Loading..."}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <span>Gaming Server</span>
                      <ChevronDown className="ml-auto h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Servers</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Gaming Server</DropdownMenuItem>
                    <DropdownMenuItem>Community Hub</DropdownMenuItem>
                    <DropdownMenuItem>Study Group</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span>Add Server</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <Button variant="outline" size="icon" className="h-8 w-8 md:hidden">
              <Command className="h-4 w-4" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">
                {activeSection === "home" && "Dashboard"}
                {activeSection === "commands" && "Custom Commands"}
                {activeSection === "reaction-roles" && "Reaction Roles"}
                {activeSection === "youtube-feeds" && "YouTube Feeds"}
                {activeSection === "automod" && "Auto-Moderation"}
                {activeSection === "logging" && "Logging"}
                {activeSection === "settings" && "Settings"}
              </h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src="/placeholder.svg?height=20&width=20" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span>Admin</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 p-4 md:p-6">
            {error && <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md mb-4">{error}</div>}

            {activeSection === "home" && (
              <>
                {isLoading ? (
                  <div className="flex justify-center p-4">Loading...</div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle>Server Stats</CardTitle>
                          <CardDescription>Overview of your server activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                              <div className="text-sm">Total Commands Used</div>
                              <div className="font-medium">{serverStats?.total_commands_used || 0}</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm">Active Users</div>
                              <div className="font-medium">{serverStats?.active_users || 0}</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm">Moderation Actions</div>
                              <div className="font-medium">{serverStats?.moderation_actions || 0}</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm">Messages Today</div>
                              <div className="font-medium">{serverStats?.messages_today || 0}</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm">New Members (Week)</div>
                              <div className="font-medium">{serverStats?.new_members_week || 0}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle>Quick Actions</CardTitle>
                          <CardDescription>Frequently used commands</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-2">
                            <Button size="sm" className="justify-start">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              <span>Send Announcement</span>
                            </Button>
                            <Button size="sm" className="justify-start">
                              <Shield className="mr-2 h-4 w-4" />
                              <span>Mute User</span>
                            </Button>
                            <Button size="sm" className="justify-start">
                              <Bell className="mr-2 h-4 w-4" />
                              <span>Create Poll</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="md:col-span-2 lg:col-span-1">
                        <CardHeader className="pb-2">
                          <CardTitle>Bot Status</CardTitle>
                          <CardDescription>Current bot configuration</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                              <div className="text-sm">Auto-moderation</div>
                              <Switch checked={botStatus?.auto_moderation} />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm">Welcome Messages</div>
                              <Switch checked={botStatus?.welcome_messages} />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm">Logging</div>
                              <Switch checked={botStatus?.logging} />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm">Uptime</div>
                              <div className="font-medium">{botStatus?.uptime || "Unknown"}</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm">Version</div>
                              <div className="font-medium">{botStatus?.version || "Unknown"}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Welcome Message Configuration</CardTitle>
                          <CardDescription>Customize the message sent to new members</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <div className="font-medium">Channel</div>
                              <Select defaultValue="welcome">
                                <SelectTrigger>
                                  <SelectValue placeholder="Select channel" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="welcome">#welcome</SelectItem>
                                  <SelectItem value="general">#general</SelectItem>
                                  <SelectItem value="introductions">#introductions</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <div className="font-medium">Message</div>
                              <Input
                                defaultValue={`Welcome ${user} to ${server}! Please read the rules in #rules.`}
                                className="h-20"
                              />
                              <div className="text-xs text-muted-foreground">
                                Use {user} for username, {server} for server name, {count} for member count
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium">Send DM</div>
                              <Switch />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium">Assign Role</div>
                              <Switch defaultChecked />
                            </div>
                            <div className="grid gap-2">
                              <div className="font-medium">Role</div>
                              <Select defaultValue="member">
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="newbie">Newbie</SelectItem>
                                  <SelectItem value="verified">Verified</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full">Save Configuration</Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </>
                )}
              </>
            )}

            {activeSection === "commands" && <CustomCommands />}
            {activeSection === "reaction-roles" && <ReactionRoles />}
            {activeSection === "youtube-feeds" && <YouTubeFeeds />}
            {activeSection === "automod" && <AutoModeration />}
            {activeSection === "logging" && <LoggingConfig />}

            {activeSection === "settings" && (
              <Card>
                <CardHeader>
                  <CardTitle>Bot Settings</CardTitle>
                  <CardDescription>Configure general bot settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Bot Prefix</label>
                      <Input defaultValue="!" className="max-w-xs" />
                      <p className="text-xs text-muted-foreground">The prefix used for bot commands (e.g. !help)</p>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Language</label>
                      <Select defaultValue="en">
                        <SelectTrigger className="max-w-xs">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="ja">Japanese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Timezone</label>
                      <Select defaultValue="utc">
                        <SelectTrigger className="max-w-xs">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc">UTC</SelectItem>
                          <SelectItem value="est">Eastern Time (EST)</SelectItem>
                          <SelectItem value="cst">Central Time (CST)</SelectItem>
                          <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                          <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="delete-command" defaultChecked />
                      <label htmlFor="delete-command" className="text-sm">
                        Delete command messages after execution
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="respond-dms" defaultChecked />
                      <label htmlFor="respond-dms" className="text-sm">
                        Respond to commands in DMs
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="mention-trigger" />
                      <label htmlFor="mention-trigger" className="text-sm">
                        Allow mention as command prefix (@BotCommand help)
                      </label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Settings</Button>
                </CardFooter>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

