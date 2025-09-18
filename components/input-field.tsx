"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface InputFieldProps {
  name: string
  label: string
  type?: "text" | "textarea" | "select"
  placeholder?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  options?: string[]
  helpText?: string
  validation?: {
    isValid: boolean
    message?: string
  }
}

export function InputField({
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  options = [],
  helpText,
  validation,
}: InputFieldProps) {
  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            id={name}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={validation && !validation.isValid ? "border-destructive" : ""}
          />
        )
      case "select":
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={validation && !validation.isValid ? "border-destructive" : ""}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      default:
        return (
          <Input
            id={name}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={validation && !validation.isValid ? "border-destructive" : ""}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={name} className="flex items-center gap-1">
          {label}
          {required && (
            <Badge variant="destructive" className="text-xs px-1">
              Required
            </Badge>
          )}
        </Label>
        {helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {renderInput()}
      {validation && !validation.isValid && validation.message && (
        <p className="text-sm text-destructive">{validation.message}</p>
      )}
    </div>
  )
}
