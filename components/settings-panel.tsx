"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ConfigManager, type UserPreferences, type SystemConfig } from "@/lib/config-manager"
import { Settings, User, Shield, Download, Upload, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SettingsPanel() {
  const [preferences, setPreferences] = useState<UserPreferences>(ConfigManager.getPreferences())
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(ConfigManager.getSystemConfig())
  const [importData, setImportData] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    setPreferences(ConfigManager.getPreferences())
    setSystemConfig(ConfigManager.getSystemConfig())
  }, [])

  const savePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates }
    setPreferences(newPreferences)
    ConfigManager.savePreferences(updates)
    toast({
      title: "Preferences saved",
      description: "Your preferences have been updated",
    })
  }

  const saveSystemConfig = (updates: Partial<SystemConfig>) => {
    const newConfig = { ...systemConfig, ...updates }
    setSystemConfig(newConfig)
    ConfigManager.saveSystemConfig(updates)
    toast({
      title: "System config saved",
      description: "System configuration has been updated",
    })
  }

  const exportConfig = () => {
    const configJson = ConfigManager.exportConfig()
    const blob = new Blob([configJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "suse-hana-utilities-config.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Config exported",
      description: "Configuration has been downloaded",
    })
  }

  const importConfig = () => {
    if (!importData.trim()) {
      toast({
        title: "Import failed",
        description: "Please paste configuration data",
        variant: "destructive",
      })
      return
    }

    const success = ConfigManager.importConfig(importData)
    if (success) {
      setPreferences(ConfigManager.getPreferences())
      setSystemConfig(ConfigManager.getSystemConfig())
      setImportData("")
      toast({
        title: "Config imported",
        description: "Configuration has been imported successfully",
      })
    } else {
      toast({
        title: "Import failed",
        description: "Invalid configuration format",
        variant: "destructive",
      })
    }
  }

  const resetToDefaults = () => {
    ConfigManager.resetToDefaults()
    setPreferences(ConfigManager.getPreferences())
    setSystemConfig(ConfigManager.getSystemConfig())
    toast({
      title: "Settings reset",
      description: "All settings have been reset to defaults",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Settings & Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preferences" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="import-export" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Import/Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultSID">Default System ID (SID)</Label>
                <Input
                  id="defaultSID"
                  value={preferences.defaultSID}
                  onChange={(e) => savePreferences({ defaultSID: e.target.value.toUpperCase() })}
                  placeholder="HDB"
                  maxLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultInstance">Default Instance Number</Label>
                <Input
                  id="defaultInstance"
                  value={preferences.defaultInstanceNumber}
                  onChange={(e) => savePreferences({ defaultInstanceNumber: e.target.value })}
                  placeholder="00"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={preferences.theme} onValueChange={(value: any) => savePreferences({ theme: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="historyLimit">Command History Limit</Label>
              <Input
                id="historyLimit"
                type="number"
                value={preferences.commandHistoryLimit}
                onChange={(e) => savePreferences({ commandHistoryLimit: Number.parseInt(e.target.value) })}
                min={10}
                max={200}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showWarnings">Show Danger Warnings</Label>
                <Switch
                  id="showWarnings"
                  checked={preferences.showDangerWarnings}
                  onCheckedChange={(checked) => savePreferences({ showDangerWarnings: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="autoSave">Auto-save Command History</Label>
                <Switch
                  id="autoSave"
                  checked={preferences.autoSaveHistory}
                  onCheckedChange={(checked) => savePreferences({ autoSaveHistory: checked })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4 mt-4">
            <div className="space-y-4">
              <h4 className="font-medium">Common Paths</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SAP Install Path</Label>
                  <Input
                    value={systemConfig.commonPaths.sapInstallPath}
                    onChange={(e) =>
                      saveSystemConfig({
                        commonPaths: { ...systemConfig.commonPaths, sapInstallPath: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Log Directory</Label>
                  <Input
                    value={systemConfig.commonPaths.logDirectory}
                    onChange={(e) =>
                      saveSystemConfig({
                        commonPaths: { ...systemConfig.commonPaths, logDirectory: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Backup Directory</Label>
                  <Input
                    value={systemConfig.commonPaths.backupDirectory}
                    onChange={(e) =>
                      saveSystemConfig({
                        commonPaths: { ...systemConfig.commonPaths, backupDirectory: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Temp Directory</Label>
                  <Input
                    value={systemConfig.commonPaths.tempDirectory}
                    onChange={(e) =>
                      saveSystemConfig({
                        commonPaths: { ...systemConfig.commonPaths, tempDirectory: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Security Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Allow Dangerous Commands</Label>
                  <Switch
                    checked={systemConfig.securitySettings.allowDangerousCommands}
                    onCheckedChange={(checked) =>
                      saveSystemConfig({
                        securitySettings: { ...systemConfig.securitySettings, allowDangerousCommands: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require Confirmation</Label>
                  <Switch
                    checked={systemConfig.securitySettings.requireConfirmation}
                    onCheckedChange={(checked) =>
                      saveSystemConfig({
                        securitySettings: { ...systemConfig.securitySettings, requireConfirmation: checked },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import-export" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={exportConfig} className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  Export Config
                </Button>
                <Button onClick={resetToDefaults} variant="outline" className="flex items-center gap-1 bg-transparent">
                  <RotateCcw className="h-4 w-4" />
                  Reset to Defaults
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="importData">Import Configuration</Label>
                <Textarea
                  id="importData"
                  placeholder="Paste configuration JSON here..."
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows={6}
                />
                <Button onClick={importConfig} className="flex items-center gap-1">
                  <Upload className="h-4 w-4" />
                  Import Config
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
