"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FileText, BarChart3, Shield, AlertTriangle, TrendingUp, Clock } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"

interface ProfileStats {
  totalAnalyses: number
  totalFiles: number
  reportsGenerated: number
  issuesDetected: number
  recentActivity: number
  avgRiskLevel: string
}

interface RecentAnalysis {
  id: string
  file_name: string
  created_at: string
  risk_level: string
  plagiarism_score: number
}

export function ProfileStats() {
  const [stats, setStats] = useState<ProfileStats>({
    totalAnalyses: 0,
    totalFiles: 0,
    reportsGenerated: 0,
    issuesDetected: 0,
    recentActivity: 0,
    avgRiskLevel: "LOW",
  })
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    if (!user) return

    try {
      // Get analysis reports count and statistics
      const { data: reports, error } = await supabase
        .from("analysis_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching stats:", error)
        return
      }

      const totalAnalyses = reports?.length || 0
      const reportsGenerated = reports?.filter((r) => r.report_html).length || 0

      // Count issues across all reports
      const issuesDetected =
        reports?.reduce((sum, r) => {
          let issues = 0
          if (r.plagiarism_score > 0.1) issues++
          if (r.forgery_detected) issues++
          if (r.privacy_issues_count > 0) issues++
          return sum + issues
        }, 0) || 0

      // Recent activity (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentActivity = reports?.filter((r) => new Date(r.created_at) > sevenDaysAgo).length || 0

      // Calculate average risk level
      const riskCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 }
      reports?.forEach((r) => {
        riskCounts[r.risk_level as keyof typeof riskCounts]++
      })

      let avgRiskLevel = "LOW"
      if (riskCounts.HIGH > riskCounts.MEDIUM && riskCounts.HIGH > riskCounts.LOW) {
        avgRiskLevel = "HIGH"
      } else if (riskCounts.MEDIUM > riskCounts.LOW) {
        avgRiskLevel = "MEDIUM"
      }

      setStats({
        totalAnalyses,
        totalFiles: totalAnalyses, // Assuming 1 file per analysis for now
        reportsGenerated,
        issuesDetected,
        recentActivity,
        avgRiskLevel,
      })

      // Set recent analyses for the activity feed
      setRecentAnalyses(reports?.slice(0, 5) || [])
    } catch (error) {
      console.error("Error fetching profile stats:", error)
    } finally {
      setLoading(false)
    }
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

  const getSuccessRate = () => {
    if (stats.totalAnalyses === 0) return 100
    const cleanAnalyses = stats.totalAnalyses - stats.issuesDetected
    return Math.round((cleanAnalyses / stats.totalAnalyses) * 100)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Account Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Account Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-6 w-6 text-purple-600" />
                <Badge variant="outline" className="text-xs">
                  Total
                </Badge>
              </div>
              <div className="text-2xl font-bold text-purple-900">{stats.totalAnalyses}</div>
              <div className="text-sm text-purple-700">Analyses Completed</div>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <Badge variant="outline" className="text-xs">
                  Files
                </Badge>
              </div>
              <div className="text-2xl font-bold text-blue-900">{stats.totalFiles}</div>
              <div className="text-sm text-blue-700">Files Processed</div>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <Shield className="h-6 w-6 text-green-600" />
                <Badge variant="outline" className="text-xs">
                  Reports
                </Badge>
              </div>
              <div className="text-2xl font-bold text-green-900">{stats.reportsGenerated}</div>
              <div className="text-sm text-green-700">Reports Generated</div>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <Badge variant="outline" className="text-xs">
                  Issues
                </Badge>
              </div>
              <div className="text-2xl font-bold text-orange-900">{stats.issuesDetected}</div>
              <div className="text-sm text-orange-700">Issues Detected</div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Content Safety Rate</span>
                <span className="text-sm text-gray-600">{getSuccessRate()}%</span>
              </div>
              <Progress value={getSuccessRate()} className="h-2" />
              <p className="text-xs text-gray-500">Percentage of analyses with no major issues detected</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recent Activity</span>
                <Badge className={getRiskColor(stats.avgRiskLevel)}>{stats.avgRiskLevel} Risk Avg</Badge>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm">{stats.recentActivity} analyses in the last 7 days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Card */}
      {recentAnalyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAnalyses.map((analysis) => (
                <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">{analysis.file_name}</p>
                      <p className="text-xs text-gray-500">{new Date(analysis.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskColor(analysis.risk_level)} variant="outline">
                      {analysis.risk_level}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {Math.round((1 - analysis.plagiarism_score) * 100)}% original
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
