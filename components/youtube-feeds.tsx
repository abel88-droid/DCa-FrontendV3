"use client"

import * as React from "react"
import { Plus, Trash2, Youtube } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getYouTubeFeeds, deleteYouTubeFeed } from "@/lib/api-client"

export function YouTubeFeeds() {
  const [feeds, setFeeds] = React.useState([
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
  ])

  const [showAddForm, setShowAddForm] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    const fetchFeeds = async () => {
      setIsLoading(true)
      setError("")

      try {
        const data = await getYouTubeFeeds()
        setFeeds(data)
      } catch (err) {
        console.error("Failed to load YouTube feeds:", err)
        setError("Failed to load YouTube feeds. Using fallback data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeeds()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteYouTubeFeed(id)
      setFeeds(feeds.filter((feed) => feed.id !== id))
    } catch (err) {
      setError("Failed to delete YouTube feed")
      console.error(err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>YouTube Feed Subscriptions</CardTitle>
        <CardDescription>Get notified when your favorite YouTube channels upload new videos</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md mb-4">{error}</div>}

        {isLoading ? (
          <div className="flex justify-center p-4">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>Notification Channel</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead>Mention @everyone</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeds.map((feed) => (
                <TableRow key={feed.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-500" />
                      {feed.channel_name}
                    </div>
                  </TableCell>
                  <TableCell>#{feed.notification_channel}</TableCell>
                  <TableCell>
                    <Switch checked={feed.enabled} />
                  </TableCell>
                  <TableCell>
                    <Switch checked={feed.mention_everyone} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(feed.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {showAddForm ? (
          <div className="mt-4 border rounded-md p-4">
            <h3 className="text-sm font-medium mb-3">Add YouTube Feed</h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">YouTube Channel URL or ID</label>
                <Input placeholder="https://www.youtube.com/channel/..." />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Notification Channel</label>
                <Select defaultValue="general">
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">#general</SelectItem>
                    <SelectItem value="youtube-notifications">#youtube-notifications</SelectItem>
                    <SelectItem value="announcements">#announcements</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="mention-everyone" />
                <label htmlFor="mention-everyone" className="text-sm font-medium">
                  Mention @everyone
                </label>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowAddForm(false)} variant="outline">
                  Cancel
                </Button>
                <Button>Add Feed</Button>
              </div>
            </div>
          </div>
        ) : (
          <Button className="mt-4" onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add YouTube Feed
          </Button>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 border-t pt-6">
        <h3 className="text-sm font-medium">Message Format</h3>
        <Input className="font-mono text-sm" defaultValue="**{channel}** just uploaded **{title}**! {url}" />
        <p className="text-xs text-muted-foreground mt-1">
          Available variables: {"{channel}"} - Channel name, {"{title}"} - Video title, {"{url}"} - Video URL
        </p>
        <Button className="mt-2">Save Message Format</Button>
      </CardFooter>
    </Card>
  )
}

