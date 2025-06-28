"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploader } from "@/components/file-uploader"
import { AnalysisResults } from "@/components/analysis-results"
import { EnhancedAnalysisHistory } from "@/components/enhanced-analysis-history"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, FileText, Clock, Settings, Shield } from "lucide-react"
import type { FileType } from "@/lib/types"
import { supabase } from "@/lib/supabase"

export default function Dashboard() {
  const [files, setFiles] = useState<FileType[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshHistory, setRefreshHistory] = useState(0)
  const [authToken, setAuthToken] = useState<string | null>(null)

  const { user, session, loading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }

    // Get the session token for API requests
    const getToken = async () => {
      if (session) {
        setAuthToken(session.access_token)
      } else {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          setAuthToken(data.session.access_token)
        }
      }
    }

    getToken()
  }, [user, session, loading, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleFileUpload = (uploadedFiles: FileType[]) => {
    setFiles((prevFiles) => [...prevFiles, ...uploadedFiles])
    setError(null)
  }

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const analyzeFiles = async () => {
    if (files.length === 0) return

    setIsAnalyzing(true)
    setError(null)

    try {
      // Create FormData to send files
      const formData = new FormData()
      files.forEach((file) => {
        formData.append("files", file.file)
      })

      // Send to the analyze API endpoint
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResults(data)

      // Save the analysis to database immediately after getting results
      try {
        console.log("Saving analysis to database...")

        const saveResponse = await fetch("/api/save-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken ? `Bearer ${authToken}` : "",
          },
          body: JSON.stringify({
            fileName: files[0]?.name || "Unknown document",
            fileType: files[0]?.type || "unknown",
            fileSize: files[0]?.size || 0,
            results: data,
          }),
        })

        if (saveResponse.ok) {
          const saveData = await saveResponse.json()
          console.log("Analysis saved successfully:", saveData)

          // Refresh history to show the new analysis
          setRefreshHistory((prev) => prev + 1)

          toast({
            title: "Analysis Complete",
            description: "Your file has been analyzed and saved to your history.",
          })
        } else {
          const saveError = await saveResponse.json()
          console.error("Failed to save analysis:", saveError)

          toast({
            title: "Analysis Complete",
            description: "Analysis completed but couldn't save to history. Please check your connection.",
            variant: "destructive",
          })
        }
      } catch (saveError) {
        console.error("Error saving analysis:", saveError)
        toast({
          title: "Analysis Complete",
          description: "Analysis completed but couldn't save to history.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error analyzing files:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearAll = () => {
    setFiles([])
    setResults(null)
    setError(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.user_metadata?.full_name || user.email}!</h1>
          <p className="text-gray-600 mt-1">Analyze your content for plagiarism, forgery, and privacy issues</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Shield className="h-4 w-4" />
          <span>Secure Analysis</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>Upload text, images, or PDF documents for analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader onFilesUploaded={handleFileUpload} />

                {files.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Uploaded Files ({files.length})</h3>
                    <ul className="space-y-2">
                      {files.map((file, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex flex-col">
                            <span className="truncate max-w-[200px] text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              {file.type} • {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>

                    <div className="flex gap-3 mt-4">
                      <Button
                        onClick={analyzeFiles}
                        disabled={isAnalyzing}
                        className="bg-purple-900 hover:bg-purple-800"
                      >
                        {isAnalyzing ? "Analyzing..." : "Analyze Files"}
                      </Button>
                      <Button variant="outline" onClick={clearAll}>
                        Clear All
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {results && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>Review the analysis of your uploaded content</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnalysisResults results={results} fileName={files[0]?.name} />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <EnhancedAnalysisHistory refreshTrigger={refreshHistory} authToken={authToken} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account and analysis preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Account Information</h3>
                  <p className="text-sm text-gray-600">Email: {user.email}</p>
                  <p className="text-sm text-gray-600">Name: {user.user_metadata?.full_name || "Not set"}</p>
                  <p className="text-sm text-gray-600">
                    Member since: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">User ID: {user.id}</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium mb-2 text-blue-900">Analysis Features</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✅ Plagiarism Detection</li>
                    <li>✅ Document Forgery Analysis</li>
                    <li>✅ Privacy Leak Detection</li>
                    <li>✅ Comprehensive Report Generation</li>
                    <li>✅ Analysis History Tracking</li>
                    <li>✅ Secure Cloud Storage</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium mb-2 text-green-900">Supported File Types</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>📄 Text files (.txt)</li>
                    <li>📋 PDF documents (.pdf)</li>
                    <li>📝 Word documents (.doc, .docx)</li>
                    <li>🖼️ Images (.jpg, .jpeg, .png)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
