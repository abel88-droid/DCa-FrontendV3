"use client"

import { Switch } from "@/components/ui/switch"

import * as React from "react"
import { Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getReactionRoles, deleteReactionRole } from "@/lib/api-client"

export function ReactionRoles() {
  const [reactionRoles, setReactionRoles] = React.useState([
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
  ])

  const [showAddForm, setShowAddForm] = React.useState(false)
  const [mode, setMode] = React.useState<"simple" | "advanced">("simple")
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    const fetchReactionRoles = async () => {
      setIsLoading(true)
      setError("")

      try {
        const data = await getReactionRoles()
        setReactionRoles(data)
      } catch (err) {
        console.error("Failed to load reaction roles:", err)
        setError("Failed to load reaction roles. Using fallback data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReactionRoles()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteReactionRole(id)
      setReactionRoles(reactionRoles.filter((role) => role.id !== id))
    } catch (err) {
      setError("Failed to delete reaction role")
      console.error(err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reaction Roles</CardTitle>
        <CardDescription>Let users assign themselves roles by reacting to messages</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md mb-4">{error}</div>}

        <Tabs defaultValue="existing" className="mb-4">
          <TabsList>
            <TabsTrigger value="existing">Existing Reaction Roles</TabsTrigger>
            <TabsTrigger value="new">Add New Reaction Role</TabsTrigger>
          </TabsList>
          <TabsContent value="existing">
            {isLoading ? (
              <div className="flex justify-center p-4">Loading...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message ID</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Emoji</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reactionRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-mono text-xs">{role.message_id}</TableCell>
                        <TableCell>#{role.channel}</TableCell>
                        <TableCell>{role.emoji}</TableCell>
                        <TableCell>@{role.role}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(role.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          <TabsContent value="new">
            <div className="space-y-4 border rounded-md p-4">
              <div className="flex gap-4 mb-4">
                <Button variant={mode === "simple" ? "default" : "outline"} onClick={() => setMode("simple")}>
                  Simple Mode
                </Button>
                <Button variant={mode === "advanced" ? "default" : "outline"} onClick={() => setMode("advanced")}>
                  Advanced Mode
                </Button>
              </div>

              {mode === "simple" ? (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Message ID</label>
                    <Input placeholder="Right-click message and copy ID" />
                    <p className="text-xs text-muted-foreground">
                      Enable Developer Mode in Discord settings to copy message IDs
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Channel</label>
                    <Select defaultValue="roles">
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="roles">#roles</SelectItem>
                        <SelectItem value="get-roles">#get-roles</SelectItem>
                        <SelectItem value="general">#general</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Emoji</label>
                    <Input placeholder="Enter an emoji (e.g. 🎮)" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Role</label>
                    <Select defaultValue="gamer">
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gamer">Gamer</SelectItem>
                        <SelectItem value="artist">Artist</SelectItem>
                        <SelectItem value="music">Music Lover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Message ID</label>
                    <Input placeholder="Right-click message and copy ID" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Channel</label>
                    <Select defaultValue="roles">
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="roles">#roles</SelectItem>
                        <SelectItem value="get-roles">#get-roles</SelectItem>
                        <SelectItem value="general">#general</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Mode</label>
                    <Select defaultValue="normal">
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="single">Single (Remove other reactions)</SelectItem>
                        <SelectItem value="multiple">Multiple (Allow multiple roles)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm font-medium mb-2">Reaction Role Pairs</h4>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input placeholder="Emoji" className="w-1/4" defaultValue="🎮" />
                        <Select defaultValue="gamer" className="flex-1">
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gamer">Gamer</SelectItem>
                            <SelectItem value="artist">Artist</SelectItem>
                            <SelectItem value="music">Music Lover</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="Emoji" className="w-1/4" defaultValue="🎨" />
                        <Select defaultValue="artist" className="flex-1">
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gamer">Gamer</SelectItem>
                            <SelectItem value="artist">Artist</SelectItem>
                            <SelectItem value="music">Music Lover</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Reaction-Role Pair
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Button className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Reaction Roles
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 border-t pt-6">
        <h3 className="text-sm font-medium">Settings</h3>
        <div className="flex items-center gap-2 w-full">
          <Switch id="require-verification" />
          <label htmlFor="require-verification" className="text-sm">
            Require verification level 1 (Email verified)
          </label>
        </div>
        <div className="flex items-center gap-2 w-full">
          <Switch id="dm-feedback" defaultChecked />
          <label htmlFor="dm-feedback" className="text-sm">
            Send DM feedback when role is added/removed
          </label>
        </div>
        <Button className="mt-2">Save Settings</Button>
      </CardFooter>
    </Card>
  )
}

