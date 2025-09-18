export interface ValidationResult {
  isValid: boolean
  message?: string
}

export class CommandValidator {
  static validatePath(path: string): ValidationResult {
    if (!path.trim()) {
      return { isValid: false, message: "Path cannot be empty" }
    }

    if (!path.startsWith("/")) {
      return { isValid: false, message: "Path must be absolute (start with /)" }
    }

    // Check for potentially dangerous paths
    const dangerousPaths = ["/dev", "/proc", "/sys"]
    if (dangerousPaths.some((dangerous) => path.startsWith(dangerous))) {
      return { isValid: false, message: "This path may contain system files that could cause issues" }
    }

    return { isValid: true }
  }

  static validatePattern(pattern: string): ValidationResult {
    if (!pattern.trim()) {
      return { isValid: false, message: "Pattern cannot be empty" }
    }

    // Check for potentially dangerous patterns
    if (pattern.includes("..") || pattern.includes("/")) {
      return { isValid: false, message: "Pattern should not contain path traversal characters" }
    }

    return { isValid: true }
  }

  static validateNumber(value: string, min = 1, max = 1000): ValidationResult {
    const num = Number.parseInt(value)

    if (isNaN(num)) {
      return { isValid: false, message: "Must be a valid number" }
    }

    if (num < min || num > max) {
      return { isValid: false, message: `Must be between ${min} and ${max}` }
    }

    return { isValid: true }
  }

  static validateServiceName(serviceName: string): ValidationResult {
    if (!serviceName.trim()) {
      return { isValid: false, message: "Service name cannot be empty" }
    }

    // Basic service name validation
    if (!/^[a-zA-Z0-9_-]+$/.test(serviceName)) {
      return { isValid: false, message: "Service name can only contain letters, numbers, hyphens, and underscores" }
    }

    return { isValid: true }
  }

  static validateKeyword(keyword: string): ValidationResult {
    if (!keyword.trim()) {
      return { isValid: false, message: "Search keyword cannot be empty" }
    }

    // Check for potentially problematic characters
    if (keyword.includes('"') || keyword.includes("'")) {
      return { isValid: false, message: "Keyword should not contain quotes" }
    }

    return { isValid: true }
  }
}
