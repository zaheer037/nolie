import { NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function GET() {
  try {
    console.log("Testing Gemini API...")
    console.log("API Key exists:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY)

    const { text } = await generateText({
      model: google("gemini-1.5-flash"), // Updated model name
      prompt: "Say 'Hello from Gemini!' and confirm the API is working correctly.",
    })

    return NextResponse.json({
      success: true,
      message: text,
      apiKeyConfigured: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      modelUsed: "gemini-1.5-flash",
    })
  } catch (error) {
    console.error("Gemini API test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        apiKeyConfigured: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      },
      { status: 500 },
    )
  }
}
