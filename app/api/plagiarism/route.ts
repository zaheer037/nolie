import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    // Use Gemini to analyze the text for plagiarism
    const { text: result } = await generateText({
      model: google("gemini-1.5-flash"), // Updated model name
      prompt: `You are a plagiarism detection expert. Analyze the following text for potential plagiarism.

Text to analyze: "${text.substring(0, 2000)}"

Please respond with ONLY a valid JSON object in this exact format (no markdown, no extra text):
{
  "score": 0.15,
  "matches": [
    {
      "text": "the matched text",
      "source": "potential source",
      "similarity": 0.92
    }
  ]
}`,
    })

    // Clean the response to ensure it's valid JSON
    const cleanedResult = result
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()
    const plagiarismResults = JSON.parse(cleanedResult)

    return NextResponse.json(plagiarismResults)
  } catch (error) {
    console.error("Error analyzing plagiarism:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze text for plagiarism",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
