import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    // Use Gemini to detect personally identifiable information (PII)
    const { text: result } = await generateText({
      model: google("gemini-1.5-flash"), // Updated model name
      prompt: `You are a privacy expert. Analyze the following text for personally identifiable information (PII).

Text to analyze: "${text.substring(0, 2000)}"

Look for: emails, phone numbers, addresses, ID numbers, credit card numbers, names with personal data.

Please respond with ONLY a valid JSON object in this exact format (no markdown, no extra text):
{
  "detected": true,
  "entities": [
    {
      "type": "EMAIL",
      "text": "user@example.com",
      "position": { "start": 120, "end": 136 }
    }
  ]
}`,
    })

    // Clean the response to ensure it's valid JSON
    const cleanedResult = result
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()
    const privacyResults = JSON.parse(cleanedResult)

    return NextResponse.json(privacyResults)
  } catch (error) {
    console.error("Error analyzing privacy issues:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze text for privacy issues",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
