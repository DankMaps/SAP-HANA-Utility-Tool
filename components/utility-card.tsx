"use client"

import type React from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

interface UtilityCardProps {
  name: string
  description: string
  icon: React.ReactNode
  category: string
  isSelected: boolean
  onClick: () => void
  lastUsed?: Date
}

export function UtilityCard({ name, description, icon, category, isSelected, onClick, lastUsed }: UtilityCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          </div>
          {lastUsed && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {lastUsed.toLocaleDateString()}
            </div>
          )}
        </div>
        <CardTitle className="text-base">{name}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
