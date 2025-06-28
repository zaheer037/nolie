"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle, FileWarning, Download, FileText, Share2, Copy, Mail, Link } from "lucide-react"

interface AnalysisResultsProps {
  results: {
    plagiarism: {
      score: number
      matches: Array<{
        text: string
        source: string
        similarity: number
      }>
    }
    forgery: {
      detected: boolean
      confidence: number
      areas: any[]
    }
    privacy: {
      detected: boolean
      entities: Array<{
        type: string
        text: string
        position: {
          start: number
          end: number
        }
      }>
    }
  }
  fileName?: string
}

export function AnalysisResults({ results, fileName }: AnalysisResultsProps) {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareForm, setShareForm] = useState({
    email: "",
    message: "",
    includeDetails: true,
  })
  const [shareLoading, setShareLoading] = useState(false)
  const { toast } = useToast()

  const plagiarismPercentage = Math.round(results.plagiarism.score * 100)
  const originalityPercentage = 100 - plagiarismPercentage

  const getScoreColor = (score: number) => {
    if (score < 0.1) return "text-green-600"
    if (score < 0.3) return "text-yellow-600"
    return "text-red-600"
  }

  const getProgressColor = (score: number) => {
    if (score < 0.1) return "bg-green-600"
    if (score < 0.3) return "bg-yellow-600"
    return "bg-red-600"
  }

  const downloadReport = async () => {
    setIsGeneratingReport(true)
    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          results,
          fileName,
          analysisDate: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      const data = await response.json()

      // Create and download HTML file
      const blob = new Blob([data.reportHtml], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `NoLie_AI_Report_${fileName || "Analysis"}_${new Date().toISOString().split("T")[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Report Downloaded",
        description: "Your analysis report has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error downloading report:", error)
      toast({
        title: "Download Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const generateShareableLink = () => {
    const shareData = {
      fileName: fileName || "Document",
      originalityScore: originalityPercentage,
      plagiarismScore: plagiarismPercentage,
      forgeryDetected: results.forgery.detected,
      privacyIssues: results.privacy.entities.length,
      timestamp: new Date().toISOString(),
    }

    // Create a shareable URL with encoded data
    const encodedData = btoa(JSON.stringify(shareData))
    const shareUrl = `${window.location.origin}/shared-results?data=${encodedData}`

    return shareUrl
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to Clipboard",
        description: "The content has been copied to your clipboard.",
      })
    } catch (error) {
      console.error("Failed to copy:", error)
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive",
      })
    }
  }

  const shareViaEmail = async () => {
    if (!shareForm.email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to share the results.",
        variant: "destructive",
      })
      return
    }

    setShareLoading(true)
    try {
      const shareUrl = generateShareableLink()
      const emailSubject = `NoLie AI Analysis Results - ${fileName || "Document"}`
      const emailBody = `
Hi,

I wanted to share the analysis results for "${fileName || "Document"}" with you.

Analysis Summary:
- Originality Score: ${originalityPercentage}%
- Plagiarism Score: ${plagiarismPercentage}%
- Forgery Status: ${results.forgery.detected ? "Detected" : "Not detected"}
- Privacy Issues: ${results.privacy.entities.length} found

${shareForm.message ? `\nMessage: ${shareForm.message}` : ""}

${shareForm.includeDetails ? `\nView detailed results: ${shareUrl}` : ""}

Best regards,
NoLie AI Analysis Platform
      `.trim()

      // Create mailto link
      const mailtoLink = `mailto:${shareForm.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`

      // Open email client
      window.location.href = mailtoLink

      toast({
        title: "Email Opened",
        description: "Your email client has been opened with the analysis results.",
      })

      setShowShareDialog(false)
      setShareForm({ email: "", message: "", includeDetails: true })
    } catch (error) {
      console.error("Error sharing via email:", error)
      toast({
        title: "Share Failed",
        description: "Failed to share via email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShareLoading(false)
    }
  }

  const shareResults = async () => {
    const shareText = `NoLie AI Analysis Results:
- File: ${fileName || "Document"}
- Originality: ${originalityPercentage}%
- Plagiarism: ${plagiarismPercentage}%
- Forgery: ${results.forgery.detected ? "Detected" : "Not detected"}
- Privacy Issues: ${results.privacy.entities.length} found
- Analyzed: ${new Date().toLocaleDateString()}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "NoLie AI Analysis Results",
          text: shareText,
          url: generateShareableLink(),
        })
      } catch (error) {
        console.log("Error sharing:", error)
        // Fallback to clipboard
        copyToClipboard(shareText)
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard(shareText)
    }
  }

  const shareOnSocial = (platform: string) => {
    const shareText = `Just analyzed my document with NoLie AI: ${originalityPercentage}% original content! 🔍✅`
    const shareUrl = generateShareableLink()

    let url = ""
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        break
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=400")
    }
  }

  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="insights">Insights</TabsTrigger>
        <TabsTrigger value="report">Report</TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="mt-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Originality Score</h3>
            <span className={`font-bold ${getScoreColor(results.plagiarism.score)}`}>{originalityPercentage}%</span>
          </div>
          <Progress value={originalityPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Alert variant={plagiarismPercentage > 20 ? "destructive" : "default"}>
            <FileWarning className="h-4 w-4" />
            <AlertTitle>Plagiarism</AlertTitle>
            <AlertDescription>
              {plagiarismPercentage > 20
                ? `High plagiarism detected (${plagiarismPercentage}%)`
                : `Low plagiarism detected (${plagiarismPercentage}%)`}
            </AlertDescription>
          </Alert>

          <Alert variant={results.forgery.detected ? "destructive" : "default"}>
            {results.forgery.detected ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertTitle>Forgery</AlertTitle>
            <AlertDescription>
              {results.forgery.detected ? "Document forgery detected" : "No forgery detected"}
            </AlertDescription>
          </Alert>

          <Alert variant={results.privacy.detected ? "destructive" : "default"}>
            {results.privacy.detected ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertTitle>Privacy</AlertTitle>
            <AlertDescription>
              {results.privacy.detected
                ? `${results.privacy.entities.length} privacy issues found`
                : "No privacy issues detected"}
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={downloadReport} disabled={isGeneratingReport} className="bg-purple-900 hover:bg-purple-800">
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingReport ? "Generating..." : "Download Report"}
          </Button>

          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share Results
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Share Analysis Results</DialogTitle>
                <DialogDescription>Share your analysis results with others</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Quick Share Options */}
                <div className="space-y-3">
                  <Label>Quick Share</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={shareResults} className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Summary
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(generateShareableLink())}
                      className="w-full"
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </div>

                {/* Email Share */}
                <div className="space-y-3">
                  <Label htmlFor="shareEmail">Share via Email</Label>
                  <Input
                    id="shareEmail"
                    type="email"
                    placeholder="Enter email address"
                    value={shareForm.email}
                    onChange={(e) => setShareForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Add a message (optional)"
                    value={shareForm.message}
                    onChange={(e) => setShareForm((prev) => ({ ...prev, message: e.target.value }))}
                    rows={3}
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeDetails"
                      checked={shareForm.includeDetails}
                      onChange={(e) => setShareForm((prev) => ({ ...prev, includeDetails: e.target.checked }))}
                    />
                    <Label htmlFor="includeDetails" className="text-sm">
                      Include detailed results link
                    </Label>
                  </div>
                  <Button onClick={shareViaEmail} disabled={shareLoading} className="w-full">
                    {shareLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Share via Email
                      </>
                    )}
                  </Button>
                </div>

                {/* Social Share */}
                <div className="space-y-3">
                  <Label>Share on Social Media</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" onClick={() => shareOnSocial("twitter")} className="w-full">
                      Twitter
                    </Button>
                    <Button variant="outline" onClick={() => shareOnSocial("linkedin")} className="w-full">
                      LinkedIn
                    </Button>
                    <Button variant="outline" onClick={() => shareOnSocial("facebook")} className="w-full">
                      Facebook
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TabsContent>

      <TabsContent value="details" className="mt-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Plagiarism Details</CardTitle>
          </CardHeader>
          <CardContent>
            {results.plagiarism.matches.length > 0 ? (
              <div className="space-y-3">
                {results.plagiarism.matches.map((match, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Matched Text:</p>
                        <p className="text-sm text-gray-700 mt-1 italic">"{match.text}"</p>
                      </div>
                      <Badge className={getProgressColor(match.similarity)}>
                        {Math.round(match.similarity * 100)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Source: {match.source}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No plagiarism matches found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Issues</CardTitle>
          </CardHeader>
          <CardContent>
            {results.privacy.entities.length > 0 ? (
              <div className="space-y-3">
                {results.privacy.entities.map((entity, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium">Detected {entity.type}:</p>
                        <p className="text-sm text-gray-700 mt-1 font-mono bg-gray-100 px-2 py-1 rounded">
                          {entity.text}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {entity.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No privacy issues detected.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Forgery Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Forgery Status:</span>
                <Badge variant={results.forgery.detected ? "destructive" : "default"}>
                  {results.forgery.detected ? "DETECTED" : "CLEAN"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Confidence Level:</span>
                <span className="text-sm">{Math.round(results.forgery.confidence * 100)}%</span>
              </div>
              {results.forgery.detected && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This document shows signs of potential manipulation. Further investigation recommended.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="insights" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Insights</CardTitle>
            <CardDescription>Detailed analysis and recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Content Originality</h4>
              <p className="text-sm text-blue-800">
                {originalityPercentage > 80
                  ? "Excellent! Your content shows high originality with minimal similarity to existing sources."
                  : originalityPercentage > 60
                    ? "Good originality, but consider reviewing flagged sections for proper attribution."
                    : "Significant similarities detected. Review and rewrite flagged content or add proper citations."}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Security Assessment</h4>
              <p className="text-sm text-green-800">
                {!results.forgery.detected && !results.privacy.detected
                  ? "Your document appears secure with no forgery or privacy concerns detected."
                  : "Security concerns identified. Review the detailed findings and take appropriate action."}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Recommendations</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                {plagiarismPercentage > 20 && <li>• Rewrite or properly cite flagged content</li>}
                {results.forgery.detected && <li>• Verify document authenticity through alternative means</li>}
                {results.privacy.detected && <li>• Remove or redact personal information before sharing</li>}
                <li>• Implement regular content integrity checks</li>
                <li>• Keep detailed records of analysis results</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="report" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Generate Detailed Report</CardTitle>
            <CardDescription>Download a comprehensive analysis report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Professional HTML Report</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Comprehensive report with executive summary, detailed findings, and recommendations
                  </p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium">Report includes:</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Executive summary with risk assessment</li>
                <li>• Detailed plagiarism analysis with source attribution</li>
                <li>• Document forgery detection results</li>
                <li>• Privacy and PII analysis</li>
                <li>• Professional recommendations</li>
                <li>• Technical analysis details</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={downloadReport}
                disabled={isGeneratingReport}
                className="bg-purple-900 hover:bg-purple-800"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGeneratingReport ? "Generating Report..." : "Download HTML Report"}
              </Button>
              <Button variant="outline" onClick={() => setShowShareDialog(true)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Results
              </Button>
            </div>

            <div className="text-xs text-gray-500 mt-4">
              <p>
                Report ID: NL-{Date.now()}-{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
              <p>Generated: {new Date().toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
