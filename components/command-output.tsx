"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Terminal, Check, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CommandOutputProps {
  command: string
  title?: string
  description?: string
  isValid?: boolean
  validationMessage?: string
}

export function CommandOutput({
  command,
  title = "Generated Command",
  description,
  isValid = true,
  validationMessage,
}: CommandOutputProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isValid && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Invalid
              </Badge>
            )}
            {isValid && command && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Terminal className="h-3 w-3" />
                Ready
              </Badge>
            )}
          </div>
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="relative">
          <pre
            className={`bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto min-h-[60px] ${
              !isValid ? "border border-destructive/50" : ""
            }`}
          >
            {command || "Configure inputs to generate command..."}
          </pre>
          {command && isValid && (
            <Button size="sm" className="absolute top-2 right-2" onClick={copyToClipboard} disabled={copied}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
        {!isValid && validationMessage && (
          <p className="text-sm text-destructive mt-2 flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            {validationMessage}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
