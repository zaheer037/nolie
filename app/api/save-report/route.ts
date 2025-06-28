import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    console.log("Save report API called")
    const supabase = await createClient()

    // Get the current user session for authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    let userId: string | undefined

    if (sessionError || !session?.user) {
      console.log("No session found, checking for token in headers")

      // Try to get user from request headers as fallback
      const authHeader = request.headers.get("authorization")
      if (!authHeader) {
        return NextResponse.json({ error: "No active session. Please sign in again." }, { status: 401 })
      }

      // Try to validate the token
      try {
        const token = authHeader.replace("Bearer ", "")
        const { data: userData, error: userError } = await supabase.auth.getUser(token)

        if (userError || !userData.user) {
          console.error("Invalid token:", userError)
          return NextResponse.json({ error: "Invalid authentication token." }, { status: 401 })
        }

        userId = userData.user.id
        console.log("User authenticated from token:", userId)
      } catch (tokenError) {
        console.error("Token validation error:", tokenError)
        return NextResponse.json({ error: "Authentication failed. Please sign in again." }, { status: 401 })
      }
    } else {
      userId = session.user.id
      console.log("User authenticated from session:", userId)
    }

    const { fileName, fileType, fileSize, results } = await request.json()
    console.log("Request data:", { fileName, fileType, fileSize, resultsKeys: Object.keys(results || {}) })

    if (!fileName || !results) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate risk level
    const getRiskLevel = (results: any): "LOW" | "MEDIUM" | "HIGH" => {
      const plagiarismHigh = results.plagiarism?.score > 0.3
      const forgeryDetected = results.forgery?.detected
      const privacyIssues = results.privacy?.detected

      if (plagiarismHigh || forgeryDetected || privacyIssues) return "HIGH"
      if (results.plagiarism?.score > 0.1) return "MEDIUM"
      return "LOW"
    }

    const reportData = {
      user_id: userId,
      file_name: fileName,
      file_type: fileType || "unknown",
      file_size: fileSize || 0,
      analysis_results: results,
      plagiarism_score: results.plagiarism?.score || 0,
      forgery_detected: results.forgery?.detected || false,
      privacy_issues_count: results.privacy?.entities?.length || 0,
      risk_level: getRiskLevel(results),
    }

    console.log("Saving report data:", reportData)

    // Use admin client to bypass RLS for this operation
    // We've already verified the user's authentication above
    const { data, error } = await supabaseAdmin.from("analysis_reports").insert(reportData).select().single()

    if (error) {
      console.error("Database error saving report:", error)
      return NextResponse.json({ error: `Failed to save report: ${error.message}` }, { status: 500 })
    }

    console.log("Report saved successfully:", data)
    return NextResponse.json({ success: true, reportId: data.id, data })
  } catch (error) {
    console.error("Error in save-report:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
