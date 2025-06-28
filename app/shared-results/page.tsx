"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FileText, Shield, AlertTriangle, CheckCircle, Home } from "lucide-react"
import Link from "next/link"

interface SharedData {
  fileName: string
  originalityScore: number
  plagiarismScore: number
  forgeryDetected: boolean
  privacyIssues: number
  timestamp: string
}

export default function SharedResultsPage() {
  const [sharedData, setSharedData] = useState<SharedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const data = searchParams.get("data")
    if (!data) {
      setError("No shared data found")
      return
    }

    try {
      const decodedData = JSON.parse(atob(data))
      setSharedData(decodedData)
    } catch (error) {
      console.error("Error decoding shared data:", error)
      setError("Invalid shared data")
    }
  }, [searchParams])

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Share Link</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!sharedData) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared results...</p>
        </div>
      </div>
    )
  }

  const getRiskLevel = () => {
    if (sharedData.plagiarismScore > 30 || sharedData.forgeryDetected || sharedData.privacyIssues > 0) {
      return { level: "HIGH", color: "bg-red-100 text-red-800 border-red-200" }
    }
    if (sharedData.plagiarismScore > 10) {
      return { level: "MEDIUM", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
    }
    return { level: "LOW", color: "bg-green-100 text-green-800 border-green-200" }
  }

  const risk = getRiskLevel()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shared Analysis Results</h1>
          <p className="text-gray-600">NoLie AI Content Analysis Report</p>
        </div>

        {/* Main Results Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {sharedData.fileName}
                </CardTitle>
                <CardDescription>Analyzed on {new Date(sharedData.timestamp).toLocaleDateString()}</CardDescription>
              </div>
              <Badge className={risk.color}>{risk.level} RISK</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Originality Score */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Originality Score</h3>
                <span className="font-bold text-lg">{sharedData.originalityScore}%</span>
              </div>
              <Progress value={sharedData.originalityScore} className="h-3" />
            </div>

            {/* Analysis Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              <Alert variant={sharedData.plagiarismScore > 20 ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">Plagiarism</div>
                  <div className="text-sm">{sharedData.plagiarismScore}% detected</div>
                </AlertDescription>
              </Alert>

              <Alert variant={sharedData.forgeryDetected ? "destructive" : "default"}>
                {sharedData.forgeryDetected ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <div className="font-medium">Forgery</div>
                  <div className="text-sm">{sharedData.forgeryDetected ? "Detected" : "Not detected"}</div>
                </AlertDescription>
              </Alert>

              <Alert variant={sharedData.privacyIssues > 0 ? "destructive" : "default"}>
                {sharedData.privacyIssues > 0 ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <div className="font-medium">Privacy</div>
                  <div className="text-sm">{sharedData.privacyIssues} issues found</div>
                </AlertDescription>
              </Alert>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Analysis Summary</h4>
              <p className="text-sm text-gray-600">
                This document shows {sharedData.originalityScore}% originality with{" "}
                {sharedData.plagiarismScore > 20 ? "high" : sharedData.plagiarismScore > 10 ? "moderate" : "low"}{" "}
                plagiarism concerns. {sharedData.forgeryDetected && "Document forgery was detected. "}{" "}
                {sharedData.privacyIssues > 0 && `${sharedData.privacyIssues} privacy issues were found.`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Want to analyze your own documents?
            </CardTitle>
            <CardDescription>
              Get detailed analysis reports with NoLie AI's advanced content integrity platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-purple-50 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium">Plagiarism Detection</h4>
                <p className="text-sm text-gray-600">Advanced NLP analysis</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium">Forgery Detection</h4>
                <p className="text-sm text-gray-600">Document authenticity verification</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium">Privacy Protection</h4>
                <p className="text-sm text-gray-600">PII detection and protection</p>
              </div>
            </div>
            <div className="text-center">
              <Button asChild className="bg-purple-900 hover:bg-purple-800">
                <Link href="/auth">Get Started Free</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by NoLie AI - Advanced Content Integrity Analysis</p>
          <p className="mt-1">
            <Link href="/" className="text-purple-600 hover:text-purple-800">
              Learn more about NoLie AI
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
