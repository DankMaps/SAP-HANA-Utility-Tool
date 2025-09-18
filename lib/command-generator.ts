import type { ValidationResult } from "./command-validator"

export interface CommandInput {
  name: string
  label: string
  type?: "text" | "textarea" | "select"
  placeholder?: string
  defaultValue?: string
  required?: boolean
  options?: string[]
  helpText?: string
  validator?: (value: string) => ValidationResult
}

export interface UtilityTemplate {
  id: string
  name: string
  description: string
  category: string
  inputs: CommandInput[]
  commandTemplate: string
  examples?: string[]
  notes?: string[]
  dangerLevel?: "safe" | "caution" | "dangerous"
}

export interface GeneratedCommand {
  command: string
  isValid: boolean
  validationErrors: string[]
  timestamp: Date
  utilityId: string
}

export class CommandGenerator {
  private static escapeShellArg(arg: string): string {
    // Escape shell arguments to prevent injection
    return `'${arg.replace(/'/g, "'\"'\"'")}'`
  }

  static generateCommand(template: UtilityTemplate, inputs: Record<string, string>): GeneratedCommand {
    const validationErrors: string[] = []
    let command = template.commandTemplate

    // Validate all inputs
    template.inputs.forEach((input) => {
      const value = inputs[input.name] || input.defaultValue || ""

      // Check required fields
      if (input.required && !value.trim()) {
        validationErrors.push(`${input.label} is required`)
        return
      }

      // Run custom validator if provided
      if (input.validator && value.trim()) {
        const validation = input.validator(value)
        if (!validation.isValid && validation.message) {
          validationErrors.push(`${input.label}: ${validation.message}`)
        }
      }

      // Replace template variables
      const placeholder = `{${input.name}}`
      if (command.includes(placeholder)) {
        // For shell commands, we need to be careful about escaping
        const escapedValue = input.type === "select" ? value : this.escapeShellArg(value)
        command = command.replace(new RegExp(placeholder, "g"), escapedValue)
      }
    })

    return {
      command,
      isValid: validationErrors.length === 0,
      validationErrors,
      timestamp: new Date(),
      utilityId: template.id,
    }
  }

  static getCommandHistory(): GeneratedCommand[] {
    if (typeof window === "undefined") return []

    try {
      const history = localStorage.getItem("command-history")
      return history ? JSON.parse(history) : []
    } catch {
      return []
    }
  }

  static saveToHistory(command: GeneratedCommand): void {
    if (typeof window === "undefined") return

    try {
      const history = this.getCommandHistory()
      history.unshift(command)

      // Keep only last 50 commands
      const trimmedHistory = history.slice(0, 50)

      localStorage.setItem("command-history", JSON.stringify(trimmedHistory))
    } catch (error) {
      console.warn("Failed to save command to history:", error)
    }
  }

  static clearHistory(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem("command-history")
  }
}
