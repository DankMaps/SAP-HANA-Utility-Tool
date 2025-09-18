export interface UserPreferences {
  defaultSID: string
  defaultInstanceNumber: string
  favoriteUtilities: string[]
  theme: "light" | "dark" | "system"
  commandHistoryLimit: number
  showDangerWarnings: boolean
  autoSaveHistory: boolean
}

export interface SystemConfig {
  commonPaths: {
    sapInstallPath: string
    logDirectory: string
    backupDirectory: string
    tempDirectory: string
  }
  networkSettings: {
    defaultTestHost: string
    timeoutSeconds: number
  }
  securitySettings: {
    allowDangerousCommands: boolean
    requireConfirmation: boolean
  }
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultSID: "HDB",
  defaultInstanceNumber: "00",
  favoriteUtilities: [],
  theme: "system",
  commandHistoryLimit: 50,
  showDangerWarnings: true,
  autoSaveHistory: true,
}

const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  commonPaths: {
    sapInstallPath: "/usr/sap",
    logDirectory: "/var/log",
    backupDirectory: "/backup",
    tempDirectory: "/tmp",
  },
  networkSettings: {
    defaultTestHost: "google.com",
    timeoutSeconds: 30,
  },
  securitySettings: {
    allowDangerousCommands: false,
    requireConfirmation: true,
  },
}

export class ConfigManager {
  private static readonly PREFERENCES_KEY = "suse-hana-utilities-preferences"
  private static readonly SYSTEM_CONFIG_KEY = "suse-hana-utilities-system-config"

  static getPreferences(): UserPreferences {
    if (typeof window === "undefined") return DEFAULT_PREFERENCES

    try {
      const stored = localStorage.getItem(this.PREFERENCES_KEY)
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES
    } catch {
      return DEFAULT_PREFERENCES
    }
  }

  static savePreferences(preferences: Partial<UserPreferences>): void {
    if (typeof window === "undefined") return

    try {
      const current = this.getPreferences()
      const updated = { ...current, ...preferences }
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(updated))
    } catch (error) {
      console.warn("Failed to save preferences:", error)
    }
  }

  static getSystemConfig(): SystemConfig {
    if (typeof window === "undefined") return DEFAULT_SYSTEM_CONFIG

    try {
      const stored = localStorage.getItem(this.SYSTEM_CONFIG_KEY)
      return stored ? { ...DEFAULT_SYSTEM_CONFIG, ...JSON.parse(stored) } : DEFAULT_SYSTEM_CONFIG
    } catch {
      return DEFAULT_SYSTEM_CONFIG
    }
  }

  static saveSystemConfig(config: Partial<SystemConfig>): void {
    if (typeof window === "undefined") return

    try {
      const current = this.getSystemConfig()
      const updated = { ...current, ...config }
      localStorage.setItem(this.SYSTEM_CONFIG_KEY, JSON.stringify(updated))
    } catch (error) {
      console.warn("Failed to save system config:", error)
    }
  }

  static resetToDefaults(): void {
    if (typeof window === "undefined") return

    localStorage.removeItem(this.PREFERENCES_KEY)
    localStorage.removeItem(this.SYSTEM_CONFIG_KEY)
  }

  static exportConfig(): string {
    const preferences = this.getPreferences()
    const systemConfig = this.getSystemConfig()
    return JSON.stringify({ preferences, systemConfig }, null, 2)
  }

  static importConfig(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson)
      if (config.preferences) {
        this.savePreferences(config.preferences)
      }
      if (config.systemConfig) {
        this.saveSystemConfig(config.systemConfig)
      }
      return true
    } catch {
      return false
    }
  }
}
