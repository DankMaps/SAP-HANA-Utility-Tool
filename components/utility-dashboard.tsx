"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { utilityTemplates, getCategoryIcon } from "@/lib/utility-templates"
import { advancedUtilities } from "@/lib/advanced-utilities"
import { CommandGenerator, type UtilityTemplate } from "@/lib/command-generator"
import { ConfigManager } from "@/lib/config-manager"
import { InputField } from "./input-field"
import { CommandOutput } from "./command-output"
import { CommandHistory } from "./command-history"
import { HanaQuickActions } from "./hana-quick-actions"
import { AdvancedOperationsPanel } from "./advanced-operations-panel"
import { SettingsPanel } from "./settings-panel"
import { Terminal, Server, Settings, History, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const allUtilities = [...utilityTemplates, ...advancedUtilities]

export function UtilityDashboard() {
  const [selectedUtility, setSelectedUtility] = useState<UtilityTemplate | null>(null)
  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [generatedCommand, setGeneratedCommand] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("utilities")
  const { toast } = useToast()

  useEffect(() => {
    const preferences = ConfigManager.getPreferences()
    // Auto-populate default values from preferences
    if (selectedUtility) {
      const updatedValues = { ...inputValues }
      selectedUtility.inputs.forEach((input) => {
        if (input.name === "sid" && !updatedValues[input.name]) {
          updatedValues[input.name] = preferences.defaultSID
        }
        if (input.name === "instanceNumber" && !updatedValues[input.name]) {
          updatedValues[input.name] = preferences.defaultInstanceNumber
        }
      })
      setInputValues(updatedValues)
    }
  }, [selectedUtility])

  const categories = Array.from(new Set(allUtilities.map((u) => u.category)))

  const handleUtilitySelect = (utility: UtilityTemplate) => {
    setSelectedUtility(utility)
    const preferences = ConfigManager.getPreferences()
    const initialValues: Record<string, string> = {}

    utility.inputs.forEach((input) => {
      if (input.name === "sid") {
        initialValues[input.name] = preferences.defaultSID
      } else if (input.name === "instanceNumber") {
        initialValues[input.name] = preferences.defaultInstanceNumber
      } else {
        initialValues[input.name] = input.defaultValue || ""
      }
    })

    setInputValues(initialValues)
    const result = CommandGenerator.generateCommand(utility, initialValues)
    setGeneratedCommand(result.command)
    setValidationErrors(result.validationErrors)
  }

  const handleInputChange = (inputName: string, value: string) => {
    const newValues = { ...inputValues, [inputName]: value }
    setInputValues(newValues)

    if (selectedUtility) {
      const result = CommandGenerator.generateCommand(selectedUtility, newValues)
      setGeneratedCommand(result.command)
      setValidationErrors(result.validationErrors)

      const preferences = ConfigManager.getPreferences()
      if (preferences.autoSaveHistory && result.isValid) {
        CommandGenerator.saveToHistory(result)
      }
    }
  }

  const handleQuickActionCommand = (command: string, title: string) => {
    setGeneratedCommand(command)
    setValidationErrors([])
    toast({
      title: "Quick action generated",
      description: `Command for "${title}" has been generated`,
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Hana Montana</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="utilities" className="flex items-center gap-1">
            <Terminal className="h-4 w-4" />
            Utilities
          </TabsTrigger>
          <TabsTrigger value="quick-actions" className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Quick Actions
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-1">
            <Server className="h-4 w-4" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="utilities" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Utility Selection Panel */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Available Utilities
                  </CardTitle>
                  <CardDescription>Select a utility to generate commands</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={categories[0]} className="w-full">
                    <TabsList className="grid grid-cols-3 gap-1 h-auto p-1 overflow-x-auto min-h-[120px]">
                      {categories.map((category) => (
                        <TabsTrigger
                          key={category}
                          value={category}
                          className="capitalize text-xs py-2 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                        >
                          {category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {categories.map((category) => (
                      <TabsContent key={category} value={category} className="space-y-2 mt-4">
                        {allUtilities
                          .filter((u) => u.category === category)
                          .map((utility) => (
                            <Button
                              key={utility.id}
                              variant={selectedUtility?.id === utility.id ? "default" : "outline"}
                              className="w-full justify-start h-auto p-3"
                              onClick={() => handleUtilitySelect(utility)}
                            >
                              <div className="flex items-start gap-3">
                                {getCategoryIcon(utility.category)}
                                <div className="text-left">
                                  <div className="font-medium text-sm">{utility.name}</div>
                                  <div className="text-xs text-muted-foreground mt-1">{utility.description}</div>
                                  {utility.dangerLevel && utility.dangerLevel !== "safe" && (
                                    <Badge variant="secondary" className="mt-1 text-xs">
                                      {utility.dangerLevel}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </Button>
                          ))}
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Command Generation Panel */}
            <div className="lg:col-span-2">
              {selectedUtility ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getCategoryIcon(selectedUtility.category)}
                        {selectedUtility.name}
                      </CardTitle>
                      <CardDescription>{selectedUtility.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedUtility.inputs.map((input) => (
                        <InputField
                          key={input.name}
                          name={input.name}
                          label={input.label}
                          type={input.type}
                          placeholder={input.placeholder}
                          value={inputValues[input.name] || ""}
                          onChange={(value) => handleInputChange(input.name, value)}
                          required={input.required}
                          options={input.options}
                          helpText={input.helpText}
                          validation={
                            input.validator ? input.validator(inputValues[input.name] || "") : { isValid: true }
                          }
                        />
                      ))}
                    </CardContent>
                  </Card>

                  <CommandOutput
                    command={generatedCommand}
                    isValid={validationErrors.length === 0}
                    validationMessage={validationErrors.join(", ")}
                  />
                </div>
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <CardContent className="text-center">
                    <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a Utility</h3>
                    <p className="text-muted-foreground">
                      Choose a utility from the left panel to start generating commands
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quick-actions" className="mt-6">
          <HanaQuickActions onCommandGenerate={handleQuickActionCommand} />
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          <AdvancedOperationsPanel onCommandGenerate={handleQuickActionCommand} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <CommandHistory onCommandSelect={(command) => setGeneratedCommand(command)} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
