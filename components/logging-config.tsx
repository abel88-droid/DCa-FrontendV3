"use client"

import * as React from "react"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getLogs, updateLog } from "@/lib/api-client"

interface LogConfig {
  id: string
  event_type: string
  channel: string
  enabled: boolean
}

export function LoggingConfig() {
  const [logs, setLogs] = React.useState<LogConfig[]>([
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
  ])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true)
      setError("")

      try {
        const data = await getLogs()
        setLogs(data)
      } catch (err) {
        console.error("Failed to load logging configuration:", err)
        setError("Failed to load logging configuration. Using fallback data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const logToUpdate = logs.find((log) => log.id === id)
      if (!logToUpdate) return

      const updatedLog = { ...logToUpdate, enabled }
      await updateLog(id, updatedLog)

      setLogs(logs.map((log) => (log.id === id ? { ...log, enabled } : log)))
    } catch (err) {
      setError("Failed to update log configuration")
      console.error(err)
    }
  }

  const handleChannelChange = async (id: string, channel: string) => {
    try {
      const logToUpdate = logs.find((log) => log.id === id)
      if (!logToUpdate) return

      const updatedLog = { ...logToUpdate, channel }
      await updateLog(id, updatedLog)

      setLogs(logs.map((log) => (log.id === id ? { ...log, channel } : log)))
    } catch (err) {
      setError("Failed to update log configuration")
      console.error(err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logging Configuration</CardTitle>
        <CardDescription>Configure which events are logged and where they are sent</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md mb-4">{error}</div>}

        {isLoading ? (
          <div className="flex justify-center p-4">Loading...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Enabled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.event_type}</TableCell>
                    <TableCell>
                      <Select defaultValue={log.channel} onValueChange={(value) => handleChannelChange(log.id, value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="logs">#logs</SelectItem>
                          <SelectItem value="mod-logs">#mod-logs</SelectItem>
                          <SelectItem value="join-leave">#join-leave</SelectItem>
                          <SelectItem value="message-logs">#message-logs</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Switch checked={log.enabled} onCheckedChange={(checked) => handleToggle(log.id, checked)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 border-t pt-6">
        <h3 className="text-sm font-medium">Global Settings</h3>
        <div className="flex items-center gap-2 w-full">
          <Switch id="log-timestamps" defaultChecked />
          <label htmlFor="log-timestamps" className="text-sm">
            Include timestamps in logs
          </label>
        </div>
        <div className="flex items-center gap-2 w-full">
          <Switch id="log-user-ids" defaultChecked />
          <label htmlFor="log-user-ids" className="text-sm">
            Include user IDs in logs
          </label>
        </div>
        <div className="flex items-center gap-2 w-full">
          <Switch id="log-attachments" />
          <label htmlFor="log-attachments" className="text-sm">
            Log message attachments
          </label>
        </div>
        <Button className="mt-2">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  )
}

