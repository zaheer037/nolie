import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: NextRequest) {
  try {
    const { text, summaryType = "general" } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    let prompt = ""

    switch (summaryType) {
      case "academic":
        prompt = `Provide an academic summary of the following text, highlighting key concepts, methodology, and conclusions:`
        break
      case "executive":
        prompt = `Provide an executive summary of the following text, focusing on key points and actionable insights:`
        break
      case "brief":
        prompt = `Provide a brief summary of the following text in 2-3 sentences:`
        break
      default:
        prompt = `Provide a comprehensive summary of the following text:`
    }

    // Use Gemini to summarize the document
    const { text: result } = await generateText({
      model: google("gemini-pro"),
      prompt: `${prompt}
      
      Text to summarize:
      ${text}
      
      Return a JSON object with:
      {
        "summary": "The generated summary",
        "keyPoints": ["key point 1", "key point 2", "key point 3"],
        "wordCount": {
          "original": 1500,
          "summary": 150
        },
        "topics": ["main topic 1", "main topic 2"]
      }`,
    })

    // Parse the result
    const summaryResults = JSON.parse(result)
    return NextResponse.json(summaryResults)
  } catch (error) {
    console.error("Error summarizing document:", error)
    return NextResponse.json({ error: "Failed to summarize document" }, { status: 500 })
  }
}
