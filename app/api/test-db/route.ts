import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    console.log("Testing database connection...")
    const supabase = await createClient()

    // Test authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    console.log("Session check:", { hasSession: !!session, error: sessionError?.message })

    // Try to get user from request headers as fallback if no session
    let userId: string | undefined
    let userEmail: string | undefined

    if (!session || !session.user) {
      const authHeader = request.headers.get("authorization")
      if (authHeader) {
        try {
          const token = authHeader.replace("Bearer ", "")
          const { data: userData, error: userError } = await supabase.auth.getUser(token)

          if (!userError && userData.user) {
            userId = userData.user.id
            userEmail = userData.user.email
            console.log("User authenticated from token:", userId)
          }
        } catch (tokenError) {
          console.error("Token validation error:", tokenError)
        }
      }
    } else {
      userId = session.user.id
      userEmail = session.user.email
    }

    // Test database connection by checking tables
    const { data: tables, error: tablesError } = await supabase
      .from("analysis_reports")
      .select("count", { count: "exact", head: true })

    console.log("Database check:", { tablesError: tablesError?.message, count: tables })

    // If user is authenticated, try to fetch their reports
    let userReports = null
    if (userId) {
      const { data: reports, error: reportsError } = await supabase
        .from("analysis_reports")
        .select("*")
        .eq("user_id", userId)
        .limit(5)

      console.log("User reports check:", { reportsError: reportsError?.message, count: reports?.length })
      userReports = reports
    }

    return NextResponse.json({
      success: true,
      session: {
        authenticated: !!session || !!userId,
        userId,
        email: userEmail,
      },
      database: {
        connected: !tablesError,
        error: tablesError?.message,
      },
      userReports: {
        count: userReports?.length || 0,
        reports: userReports,
      },
      environment: {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    })
  } catch (error) {
    console.error("Database test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
