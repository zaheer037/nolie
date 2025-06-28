import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    console.log("Get reports API called")
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

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const riskLevel = searchParams.get("riskLevel")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Use admin client to bypass RLS, but filter by user_id for security
    let query = supabaseAdmin.from("analysis_reports").select("*").eq("user_id", userId)

    // Apply filters
    if (riskLevel && riskLevel !== "ALL") {
      query = query.eq("risk_level", riskLevel)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: reports, error } = await query

    if (error) {
      console.error("Error fetching reports:", error)
      return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
    }

    console.log(`Found ${reports?.length || 0} reports for user`)

    // Get total count for pagination
    const { count: totalCount } = await supabaseAdmin
      .from("analysis_reports")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    return NextResponse.json({
      reports: reports || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Error in get-reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
