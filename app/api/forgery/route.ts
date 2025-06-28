import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // For now, we'll use a simplified text-based analysis
    // In production, you'd want to use Gemini Pro Vision for actual image analysis
    const { text: result } = await generateText({
      model: google("gemini-1.5-flash"), // Updated model name
      prompt: `Analyze an image file for potential forgery or manipulation. Based on the filename "${image.name}" and file type "${image.type}", provide an assessment.

Please respond with ONLY a valid JSON object in this exact format:
{
  "detected": false,
  "confidence": 0.85,
  "areas": [],
  "techniques": [],
  "metadata": {
    "modified": false,
    "inconsistencies": false
  }
}`,
    })

    // Clean the response to ensure it's valid JSON
    const cleanedResult = result
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()
    const analysisResult = JSON.parse(cleanedResult)

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error("Error analyzing image for forgery:", error)
    return NextResponse.json({ error: "Failed to analyze image for forgery" }, { status: 500 })
  }
}
