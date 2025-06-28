"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AnalysisResults } from "./analysis-results"
import { FileText, Calendar, Eye } from "lucide-react"

interface AnalysisHistoryProps {
  history: Array<{
    id: number
    fileName: string
    analysisDate: string
    results: any
    fileCount: number
  }>
}

export function AnalysisHistory({ history }: AnalysisHistoryProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null)

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>View your previous analysis results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No analysis history found</p>
            <p className="text-sm text-gray-400">Upload and analyze files to see your history here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getRiskLevel = (results: any) => {
    const plagiarismHigh = results.plagiarism.score > 0.3
    const forgeryDetected = results.forgery.detected
    const privacyIssues = results.privacy.detected

    if (plagiarismHigh || forgeryDetected || privacyIssues) return "HIGH"
    if (results.plagiarism.score > 0.1) return "MEDIUM"
    return "LOW"
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  if (selectedAnalysis) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analysis Details</CardTitle>
              <CardDescription>{selectedAnalysis.fileName}</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setSelectedAnalysis(null)}>
              Back to History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AnalysisResults results={selectedAnalysis.results} fileName={selectedAnalysis.fileName} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis History</CardTitle>
        <CardDescription>View and manage your previous analysis results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((item) => {
            const riskLevel = getRiskLevel(item.results)
            const plagiarismScore = Math.round((1 - item.results.plagiarism.score) * 100)

            return (
              <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <h3 className="font-medium truncate max-w-[300px]">{item.fileName}</h3>
                      <Badge className={getRiskColor(riskLevel)}>{riskLevel} RISK</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(item.analysisDate).toLocaleDateString()}
                      </div>
                      <span>Files: {item.fileCount}</span>
                      <span>Originality: {plagiarismScore}%</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span
                        className={`px-2 py-1 rounded ${
                          item.results.plagiarism.score > 0.2
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        Plagiarism: {Math.round(item.results.plagiarism.score * 100)}%
                      </span>
                      <span
                        className={`px-2 py-1 rounded ${
                          item.results.forgery.detected ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        Forgery: {item.results.forgery.detected ? "Detected" : "Clean"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded ${
                          item.results.privacy.detected ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        Privacy: {item.results.privacy.entities.length} issues
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedAnalysis(item)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
