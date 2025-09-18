"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, Activity, HardDrive, Users, FileText, Shield } from "lucide-react"

interface QuickAction {
  id: string
  name: string
  description: string
  command: string
  category: "monitoring" | "maintenance" | "troubleshooting"
  icon: React.ReactNode
  dangerLevel: "safe" | "caution" | "dangerous"
}

const quickActions: QuickAction[] = [
  {
    id: "hana-overview",
    name: "System Overview",
    description: "Quick HANA system health check",
    command: "ps -ef | grep hdb | wc -l && df -h | grep hana && free -h",
    category: "monitoring",
    icon: <Activity className="h-4 w-4" />,
    dangerLevel: "safe",
  },
  {
    id: "hana-ports",
    name: "HANA Ports",
    description: "Check HANA listening ports",
    command: "netstat -tuln | grep -E ':(3[0-9]{3}|5[0-9]{3})' | sort",
    category: "monitoring",
    icon: <Database className="h-4 w-4" />,
    dangerLevel: "safe",
  },
  {
    id: "hana-disk-space",
    name: "HANA Disk Space",
    description: "Check disk space for HANA directories",
    command: "df -h | grep -E '(hana|sap|usr)' | sort",
    category: "monitoring",
    icon: <HardDrive className="h-4 w-4" />,
    dangerLevel: "safe",
  },
  {
    id: "recent-hana-logs",
    name: "Recent HANA Errors",
    description: "Find recent errors in HANA logs",
    command: "find /usr/sap -name '*.trc' -mtime -1 -exec grep -l 'ERROR\\|FATAL' {} \\; 2>/dev/null | head -5",
    category: "troubleshooting",
    icon: <FileText className="h-4 w-4" />,
    dangerLevel: "safe",
  },
  {
    id: "hana-memory-pressure",
    name: "Memory Pressure",
    description: "Check for memory pressure indicators",
    command: "dmesg | grep -i 'out of memory\\|killed process' | tail -10",
    category: "troubleshooting",
    icon: <Shield className="h-4 w-4" />,
    dangerLevel: "safe",
  },
  {
    id: "sap-users",
    name: "SAP System Users",
    description: "List SAP-related system users",
    command: "getent passwd | grep -E '(adm|sap)' | cut -d: -f1,5",
    category: "monitoring",
    icon: <Users className="h-4 w-4" />,
    dangerLevel: "safe",
  },
]

interface HanaQuickActionsProps {
  onCommandGenerate: (command: string, title: string) => void
}

export function HanaQuickActions({ onCommandGenerate }: HanaQuickActionsProps) {
  const getDangerColor = (level: string) => {
    switch (level) {
      case "safe":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "caution":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "dangerous":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const categories = Array.from(new Set(quickActions.map((action) => action.category)))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          HANA Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category} className="space-y-3">
              <h4 className="font-medium capitalize text-sm text-muted-foreground">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickActions
                  .filter((action) => action.category === category)
                  .map((action) => (
                    <div key={action.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {action.icon}
                          <span className="font-medium text-sm">{action.name}</span>
                        </div>
                        <Badge className={`text-xs ${getDangerColor(action.dangerLevel)}`}>{action.dangerLevel}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => onCommandGenerate(action.command, action.name)}
                      >
                        Generate Command
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
