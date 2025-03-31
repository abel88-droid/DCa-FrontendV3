"use client"

import * as React from "react"
import { Code, Edit, Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getCommands, deleteCommand } from "@/lib/api-client"

export function CustomCommands() {
  const [commands, setCommands] = React.useState([
    {
      id: "1",
      trigger: "!help",
      trigger_type: "Command",
      response: "Here are the available commands: !help, !rules, !welcome",
      roles: "Everyone",
      channels: "All",
    },
    {
      id: "2",
      trigger: "!rules",
      trigger_type: "Command",
      response: "1. Be respectful\n2. No spamming\n3. Follow Discord TOS",
      roles: "Everyone",
      channels: "All",
    },
    {
      id: "3",
      trigger: "-warn",
      trigger_type: "Command",
      response: "User has been warned!",
      roles: "Moderator",
      channels: "mod-commands",
    },
    {
      id: "4",
      trigger: "&rank",
      trigger_type: "Command",
      response: "Your rank is: {rank}",
      roles: "Everyone",
      channels: "bot-commands",
    },
  ])

  const [editingCommand, setEditingCommand] = React.useState<string | null>(null)
  const [showAddForm, setShowAddForm] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    const fetchCommands = async () => {
      setIsLoading(true)
      setError("")

      try {
        const data = await getCommands()
        setCommands(data)
      } catch (err) {
        console.error("Failed to load commands:", err)
        setError("Failed to load commands. Using fallback data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommands()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteCommand(id)
      setCommands(commands.filter((command) => command.id !== id))
    } catch (err) {
      setError("Failed to delete command")
      console.error(err)
    }
  }

  const handleEdit = (id: string) => {
    setEditingCommand(id)
    setShowAddForm(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Commands</CardTitle>
        <CardDescription>Create and manage custom commands for your server</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md mb-4">{error}</div>}

        <Tabs defaultValue="commands">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="commands">Commands</TabsTrigger>
            <TabsTrigger value="add">Add Command</TabsTrigger>
            <TabsTrigger value="groups">Command Groups</TabsTrigger>
          </TabsList>
          <TabsContent value="commands" className="pt-4">
            <div className="flex gap-2 mb-4">
              <Input placeholder="Search commands..." className="max-w-sm" />
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="command">Command (!)</SelectItem>
                  <SelectItem value="prefix">Prefix Commands (&)</SelectItem>
                  <SelectItem value="minus">Minus Commands (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center p-4">Loading...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trigger</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Channels</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commands.map((command) => (
                      <TableRow key={command.id}>
                        <TableCell className="font-medium">{command.trigger}</TableCell>
                        <TableCell>{command.trigger_type}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{command.response}</TableCell>
                        <TableCell>{command.roles}</TableCell>
                        <TableCell>{command.channels}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(command.id)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(command.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {editingCommand && (
              <div className="mt-6 border rounded-md p-4">
                <h3 className="text-sm font-medium mb-3">Edit Command</h3>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Trigger</label>
                      <Input defaultValue={commands.find((c) => c.id === editingCommand)?.trigger} />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Trigger Type</label>
                      <Select defaultValue="command">
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="command">Command (!)</SelectItem>
                          <SelectItem value="prefix">Prefix Command (&)</SelectItem>
                          <SelectItem value="minus">Minus Command (-)</SelectItem>
                          <SelectItem value="regex">Regex</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Response</label>
                    <Textarea
                      rows={5}
                      defaultValue={commands.find((c) => c.id === editingCommand)?.response}
                      className="font-mono text-sm"
                    />
                    <div className="text-xs text-muted-foreground">
                      Available variables: {"{user}"} - Username, {"{server}"} - Server name, {"{channel}"} - Channel
                      name
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Roles</label>
                      <Select defaultValue="everyone">
                        <SelectTrigger>
                          <SelectValue placeholder="Select roles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="everyone">Everyone</SelectItem>
                          <SelectItem value="admin">Admin only</SelectItem>
                          <SelectItem value="mod">Moderator+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Channels</label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Select channels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Channels</SelectItem>
                          <SelectItem value="bot">Bot Channels</SelectItem>
                          <SelectItem value="general">General Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="case-sensitive" />
                    <label htmlFor="case-sensitive" className="text-sm font-medium">
                      Case Sensitive
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setEditingCommand(null)} variant="outline">
                      Cancel
                    </Button>
                    <Button>
                      <Save className="mr-2 h-4 w-4" />
                      Save Command
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="add" className="pt-4">
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-3">Add New Command</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Trigger</label>
                    <Input placeholder="e.g. !help, &rank, -warn" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Trigger Type</label>
                    <Select defaultValue="command">
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="command">Command (!)</SelectItem>
                        <SelectItem value="prefix">Prefix Command (&)</SelectItem>
                        <SelectItem value="minus">Minus Command (-)</SelectItem>
                        <SelectItem value="regex">Regex</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Response</label>
                  <Textarea rows={5} placeholder="Enter the command response here..." className="font-mono text-sm" />
                  <div className="text-xs text-muted-foreground">
                    Available variables: {"{user}"} - Username, {"{server}"} - Server name, {"{channel}"} - Channel name
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Roles</label>
                    <Select defaultValue="everyone">
                      <SelectTrigger>
                        <SelectValue placeholder="Select roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="admin">Admin only</SelectItem>
                        <SelectItem value="mod">Moderator+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Channels</label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Select channels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Channels</SelectItem>
                        <SelectItem value="bot">Bot Channels</SelectItem>
                        <SelectItem value="general">General Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="case-sensitive-new" />
                  <label htmlFor="case-sensitive-new" className="text-sm font-medium">
                    Case Sensitive
                  </label>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Command
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="groups" className="pt-4">
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-3">Command Groups</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Organize your commands into groups for better management
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <span className="font-medium">Moderation Commands</span>
                    <span className="text-xs text-muted-foreground">(3 commands)</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <span className="font-medium">Fun Commands</span>
                    <span className="text-xs text-muted-foreground">(5 commands)</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <span className="font-medium">Utility Commands</span>
                    <span className="text-xs text-muted-foreground">(2 commands)</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Command Group
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 border-t pt-6">
        <h3 className="text-sm font-medium">Advanced Settings</h3>
        <div className="flex items-center gap-2 w-full">
          <Switch id="require-prefix" defaultChecked />
          <label htmlFor="require-prefix" className="text-sm">
            Require command prefix (!, &, -)
          </label>
        </div>
        <div className="flex items-center gap-2 w-full">
          <Switch id="delete-trigger" />
          <label htmlFor="delete-trigger" className="text-sm">
            Delete trigger message
          </label>
        </div>
        <div className="flex items-center gap-2 w-full">
          <Switch id="dm-response" />
          <label htmlFor="dm-response" className="text-sm">
            Send responses as DM
          </label>
        </div>
        <Button className="mt-2">Save Settings</Button>
      </CardFooter>
    </Card>
  )
}

