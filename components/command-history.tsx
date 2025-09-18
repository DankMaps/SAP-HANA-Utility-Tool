"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CommandGenerator, type GeneratedCommand } from "@/lib/command-generator"
import { History, Copy, Trash2, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CommandHistoryProps {
  onCommandSelect?: (command: string) => void
}

export function CommandHistory({ onCommandSelect }: CommandHistoryProps) {
  const [history, setHistory] = useState<GeneratedCommand[]>([])
  const { toast } = useToast()

  useEffect(() => {
    setHistory(CommandGenerator.getCommandHistory())
  }, [])

  const copyToClipboard = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command)
      toast({
        title: "Copied to clipboard",
        description: "Command has been copied to your clipboard",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy command to clipboard",
        variant: "destructive",
      })
    }
  }

  const clearHistory = () => {
    CommandGenerator.clearHistory()
    setHistory([])
    toast({
      title: "History cleared",
      description: "Command history has been cleared",
    })
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Command History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No commands generated yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Command History
          </CardTitle>
          <Button variant="outline" size="sm" onClick={clearHistory}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {history.map((cmd, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {cmd.utilityId}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(cmd.timestamp).toLocaleString()}
                  </div>
                </div>
                <pre className="bg-muted p-2 rounded text-sm font-mono overflow-x-auto">{cmd.command}</pre>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(cmd.command)}>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  {onCommandSelect && (
                    <Button size="sm" variant="outline" onClick={() => onCommandSelect(cmd.command)}>
                      Use
                    </Button>
                  )}
                  {!cmd.isValid && (
                    <Badge variant="destructive" className="text-xs">
                      Invalid
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
