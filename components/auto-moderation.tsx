"use client"

import * as React from "react"
import { Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAutoModRules, updateAutoModRule, deleteAutoModRule } from "@/lib/api-client"

interface AutoModRule {
  id: string
  name: string
  trigger_type: string
  action: string
  enabled: boolean
}

export function AutoModeration() {
  const [rules, setRules] = React.useState<AutoModRule[]>([
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
  ])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [showAddForm, setShowAddForm] = React.useState(false)

  React.useEffect(() => {
    const fetchRules = async () => {
      setIsLoading(true)
      setError("")

      try {
        const data = await getAutoModRules()
        setRules(data)
      } catch (err) {
        console.error("Failed to load auto-moderation rules:", err)
        setError("Failed to load auto-moderation rules. Using fallback data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRules()
  }, [])

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const ruleToUpdate = rules.find((rule) => rule.id === id)
      if (!ruleToUpdate) return

      const updatedRule = { ...ruleToUpdate, enabled }
      await updateAutoModRule(id, updatedRule)

      setRules(rules.map((rule) => (rule.id === id ? { ...rule, enabled } : rule)))
    } catch (err) {
      setError("Failed to update rule")
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAutoModRule(id)
      setRules(rules.filter((rule) => rule.id !== id))
    } catch (err) {
      setError("Failed to delete rule")
      console.error(err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto-Moderation</CardTitle>
        <CardDescription>Configure automatic moderation rules for your server</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rules">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="add">Add Rule</TabsTrigger>
            <TabsTrigger value="banned-words">Banned Words</TabsTrigger>
          </TabsList>
          <TabsContent value="rules" className="pt-4">
            {error && <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md mb-4">{error}</div>}

            {isLoading ? (
              <div className="flex justify-center p-4">Loading...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Trigger Type</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Enabled</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>{rule.trigger_type}</TableCell>
                        <TableCell>{rule.action}</TableCell>
                        <TableCell>
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(checked) => handleToggle(rule.id, checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
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
          <TabsContent value="add" className="pt-4">
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-3">Add New Rule</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Rule Name</label>
                  <Input placeholder="e.g. Anti-Spam, Link Filter" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Trigger Type</label>
                  <Select defaultValue="spam">
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spam">Spam</SelectItem>
                      <SelectItem value="banned-words">Banned Words</SelectItem>
                      <SelectItem value="links">Links</SelectItem>
                      <SelectItem value="mentions">Mass Mentions</SelectItem>
                      <SelectItem value="caps">Excessive Caps</SelectItem>
                      <SelectItem value="invites">Discord Invites</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Action</label>
                  <Select defaultValue="delete">
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delete">Delete Message</SelectItem>
                      <SelectItem value="warn">Warn User</SelectItem>
                      <SelectItem value="delete-warn">Delete + Warn</SelectItem>
                      <SelectItem value="mute">Mute User</SelectItem>
                      <SelectItem value="kick">Kick User</SelectItem>
                      <SelectItem value="ban">Ban User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="rule-enabled" defaultChecked />
                  <label htmlFor="rule-enabled" className="text-sm font-medium">
                    Enable Rule
                  </label>
                </div>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Rule
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="banned-words" className="pt-4">
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-3">Banned Words List</h3>
              <div className="grid gap-4">
                <Textarea
                  placeholder="Enter banned words, one per line"
                  className="min-h-[200px] font-mono text-sm"
                  defaultValue="badword1
badword2
badword3"
                />
                <div className="flex items-center gap-2">
                  <Switch id="wildcard" defaultChecked />
                  <label htmlFor="wildcard" className="text-sm font-medium">
                    Use wildcards (e.g. bad* matches badword)
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="case-sensitive" />
                  <label htmlFor="case-sensitive" className="text-sm font-medium">
                    Case sensitive matching
                  </label>
                </div>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Banned Words
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 border-t pt-6">
        <h3 className="text-sm font-medium">Global Settings</h3>
        <div className="flex items-center gap-2 w-full">
          <Switch id="ignore-admins" defaultChecked />
          <label htmlFor="ignore-admins" className="text-sm">
            Ignore administrators
          </label>
        </div>
        <div className="flex items-center gap-2 w-full">
          <Switch id="log-actions" defaultChecked />
          <label htmlFor="log-actions" className="text-sm">
            Log all moderation actions
          </label>
        </div>
        <div className="grid gap-2 w-full mt-2">
          <label className="text-sm font-medium">Mute Duration</label>
          <Select defaultValue="10m">
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5m">5 minutes</SelectItem>
              <SelectItem value="10m">10 minutes</SelectItem>
              <SelectItem value="30m">30 minutes</SelectItem>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="6h">6 hours</SelectItem>
              <SelectItem value="12h">12 hours</SelectItem>
              <SelectItem value="1d">1 day</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="mt-2">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  )
}

