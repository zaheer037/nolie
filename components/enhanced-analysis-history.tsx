"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnalysisResults } from "./analysis-results"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Calendar, Eye, Search, Filter, Download, RefreshCw } from "lucide-react"
import type { AnalysisReport } from "@/lib/supabase"

interface EnhancedAnalysisHistoryProps {
  refreshTrigger?: number
  authToken?: string | null
}

export function EnhancedAnalysisHistory({ refreshTrigger, authToken }: EnhancedAnalysisHistoryProps) {
  const [reports, setReports] = useState<AnalysisReport[]>([])
  const [selectedReport, setSelectedReport] = useState<AnalysisReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [riskFilter, setRiskFilter] = useState("ALL")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const { user, session } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchReports()
    }
  }, [user, refreshTrigger, riskFilter, sortBy, sortOrder, pagination.page, authToken])

  const fetchReports = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("Fetching reports...")
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        riskLevel: riskFilter,
        sortBy,
        sortOrder,
      })

      const headers: HeadersInit = {}
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`
      }

      const response = await fetch(`/api/get-reports?${params}`, {
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("Reports fetched:", data)

      setReports(data.reports)
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }))
    } catch (error) {
      console.error("Error fetching reports:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch reports")
      toast({
        title: "Error",
        description: "Failed to fetch analysis history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testDatabase = async () => {
    try {
      const headers: HeadersInit = {}
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`
      }

      const response = await fetch("/api/test-db", {
        headers,
      })
      const data = await response.json()
      console.log("Database test results:", data)

      toast({
        title: "Database Test",
        description: `Connected: ${data.success}, Reports: ${data.userReports?.count || 0}`,
      })
    } catch (error) {
      console.error("Database test failed:", error)
    }
  }

  const filteredReports = reports.filter((report) => report.file_name.toLowerCase().includes(searchTerm.toLowerCase()))

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

  const downloadReport = async (report: AnalysisReport) => {
    if (report.report_html) {
      const blob = new Blob([report.report_html], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `NoLie_AI_Report_${report.file_name}_${new Date(report.created_at).toISOString().split("T")[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-900 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading your analysis history...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Error loading history</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={fetchReports} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button onClick={testDatabase} variant="outline">
                Test Database
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (selectedReport) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analysis Details</CardTitle>
              <CardDescription>{selectedReport.file_name}</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Back to History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AnalysisResults results={selectedReport.analysis_results} fileName={selectedReport.file_name} />
        </CardContent>
      </Card>
    )
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>Your analysis history will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No analysis history found</p>
            <p className="text-sm text-gray-400 mb-4">Upload and analyze files to see your history here</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={fetchReports} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={testDatabase} variant="outline">
                Test Database
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Analysis History</CardTitle>
            <CardDescription>View and manage your analysis reports ({reports.length} total)</CardDescription>
          </div>
          <Button onClick={fetchReports} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Risk Levels</SelectItem>
              <SelectItem value="HIGH">High Risk</SelectItem>
              <SelectItem value="MEDIUM">Medium Risk</SelectItem>
              <SelectItem value="LOW">Low Risk</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(value) => {
              const [field, order] = value.split("-")
              setSortBy(field)
              setSortOrder(order)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at-desc">Newest First</SelectItem>
              <SelectItem value="created_at-asc">Oldest First</SelectItem>
              <SelectItem value="file_name-asc">Name A-Z</SelectItem>
              <SelectItem value="file_name-desc">Name Z-A</SelectItem>
              <SelectItem value="plagiarism_score-desc">Highest Plagiarism</SelectItem>
              <SelectItem value="plagiarism_score-asc">Lowest Plagiarism</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const originalityScore = Math.round((1 - report.plagiarism_score) * 100)

            return (
              <div key={report.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <h3 className="font-medium truncate max-w-[300px]">{report.file_name}</h3>
                      <Badge className={getRiskColor(report.risk_level)}>{report.risk_level} RISK</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(report.created_at).toLocaleDateString()}
                      </div>
                      <span>Size: {(report.file_size / 1024).toFixed(1)} KB</span>
                      <span>Originality: {originalityScore}%</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span
                        className={`px-2 py-1 rounded ${
                          report.plagiarism_score > 0.2 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        Plagiarism: {Math.round(report.plagiarism_score * 100)}%
                      </span>
                      <span
                        className={`px-2 py-1 rounded ${
                          report.forgery_detected ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        Forgery: {report.forgery_detected ? "Detected" : "Clean"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded ${
                          report.privacy_issues_count > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        Privacy: {report.privacy_issues_count} issues
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {report.report_html && (
                      <Button variant="outline" size="sm" onClick={() => downloadReport(report)}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reports
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
