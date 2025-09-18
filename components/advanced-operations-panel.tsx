"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { advancedUtilities } from "@/lib/advanced-utilities"
import { CommandGenerator } from "@/lib/command-generator"
import { InputField } from "./input-field"
import { CommandOutput } from "./command-output"
import { Settings, Shield, Wrench, Activity, AlertTriangle } from "lucide-react"

interface AdvancedOperationsPanelProps {
  onCommandGenerate?: (command: string, title: string) => void
}

export function AdvancedOperationsPanel({ onCommandGenerate }: AdvancedOperationsPanelProps) {
  const [selectedUtility, setSelectedUtility] = useState<string | null>(null)
  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [generatedCommand, setGeneratedCommand] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const categories = Array.from(new Set(advancedUtilities.map((u) => u.category)))

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "security":
        return <Shield className="h-4 w-4" />
      case "maintenance":
        return <Wrench className="h-4 w-4" />
      case "monitoring":
        return <Activity className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

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

  const handleUtilitySelect = (utilityId: string) => {
    const utility = advancedUtilities.find((u) => u.id === utilityId)
    if (!utility) return

    setSelectedUtility(utilityId)
    const initialValues: Record<string, string> = {}
    utility.inputs.forEach((input) => {
      initialValues[input.name] = input.defaultValue || ""
    })
    setInputValues(initialValues)

    const result = CommandGenerator.generateCommand(utility, initialValues)
    setGeneratedCommand(result.command)
    setValidationErrors(result.validationErrors)
  }

  const handleInputChange = (inputName: string, value: string) => {
    const newValues = { ...inputValues, [inputName]: value }
    setInputValues(newValues)

    const utility = advancedUtilities.find((u) => u.id === selectedUtility)
    if (utility) {
      const result = CommandGenerator.generateCommand(utility, newValues)
      setGeneratedCommand(result.command)
      setValidationErrors(result.validationErrors)
    }
  }

  const selectedUtilityData = advancedUtilities.find((u) => u.id === selectedUtility)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              These are advanced system operations. Always review generated commands before execution and ensure you
              have appropriate permissions and backups.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize flex items-center gap-1">
                  {getCategoryIcon(category)}
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="space-y-3 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {advancedUtilities
                    .filter((u) => u.category === category)
                    .map((utility) => (
                      <div
                        key={utility.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                          selectedUtility === utility.id ? "ring-2 ring-primary border-primary" : ""
                        }`}
                        onClick={() => handleUtilitySelect(utility.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{utility.name}</h4>
                          <Badge className={`text-xs ${getDangerColor(utility.dangerLevel)}`}>
                            {utility.dangerLevel}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{utility.description}</p>
                        {utility.notes && (
                          <div className="text-xs text-muted-foreground">
                            <strong>Notes:</strong> {utility.notes.join(", ")}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {selectedUtilityData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedUtilityData.name}</span>
                <Badge className={`${getDangerColor(selectedUtilityData.dangerLevel)}`}>
                  {selectedUtilityData.dangerLevel}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedUtilityData.inputs.map((input) => (
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
                  validation={input.validator ? input.validator(inputValues[input.name] || "") : { isValid: true }}
                />
              ))}
            </CardContent>
          </Card>

          <CommandOutput
            command={generatedCommand}
            title="Generated Advanced Command"
            isValid={validationErrors.length === 0}
            validationMessage={validationErrors.join(", ")}
          />

          {selectedUtilityData.examples && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedUtilityData.examples.map((example, index) => (
                    <pre key={index} className="bg-muted p-2 rounded text-sm font-mono overflow-x-auto">
                      {example}
                    </pre>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
