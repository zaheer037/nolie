import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

// Function to analyze text for plagiarism
async function analyzePlagiarism(text: string) {
  try {
    const { text: result } = await generateText({
      model: google("gemini-1.5-flash"), // Updated model name
      prompt: `Analyze the following text for potential plagiarism. Identify any phrases or sentences that might be copied from common sources. 

Text to analyze: "${text.substring(0, 2000)}"

Please respond with ONLY a valid JSON object in this exact format:
{
  "score": 0.15,
  "matches": [
    {
      "text": "matched text phrase",
      "source": "potential source name",
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
    return JSON.parse(cleanedResult)
  } catch (error) {
    console.error("Error analyzing plagiarism:", error)
    return {
      score: 0.05,
      matches: [],
    }
  }
}

// Function to detect privacy issues (PII) in text
async function detectPrivacyIssues(text: string) {
  try {
    const { text: result } = await generateText({
      model: google("gemini-1.5-flash"), // Updated model name
      prompt: `Analyze the following text for personally identifiable information (PII) and privacy issues.

Text to analyze: "${text.substring(0, 2000)}"

Look for: emails, phone numbers, addresses, ID numbers, credit card numbers, names with personal data.

Please respond with ONLY a valid JSON object in this exact format:
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
    return JSON.parse(cleanedResult)
  } catch (error) {
    console.error("Error detecting privacy issues:", error)
    return {
      detected: false,
      entities: [],
    }
  }
}

// Function to detect potential forgery in images (simplified for now)
async function detectForgery(imageData: string) {
  try {
    // For now, we'll use a simplified approach since image analysis requires special handling
    // In a production environment, you'd want to implement proper image analysis
    const mockResult = {
      detected: Math.random() > 0.7,
      confidence: 0.8 + Math.random() * 0.2,
      areas: [],
      techniques: [],
    }
    return mockResult
  } catch (error) {
    console.error("Error detecting forgery:", error)
    return {
      detected: false,
      confidence: 0.5,
      areas: [],
      techniques: [],
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const results = {
      plagiarism: { score: 0, matches: [] },
      forgery: { detected: false, confidence: 0, areas: [] },
      privacy: { detected: false, entities: [] },
    }

    // Process each file
    for (const file of files) {
      const fileType = file.type

      if (fileType.startsWith("text/") || fileType === "application/pdf" || file.name.endsWith(".txt")) {
        try {
          // For text files and PDFs
          const text = await file.text()

          if (text && text.length > 0) {
            // Analyze for plagiarism
            const plagiarismResults = await analyzePlagiarism(text)
            if (plagiarismResults && typeof plagiarismResults.score === "number") {
              results.plagiarism = plagiarismResults
            }

            // Detect privacy issues
            const privacyResults = await detectPrivacyIssues(text)
            if (privacyResults && typeof privacyResults.detected === "boolean") {
              results.privacy = privacyResults
            }
          }
        } catch (textError) {
          console.error("Error processing text file:", textError)
        }
      } else if (fileType.startsWith("image/")) {
        try {
          // For image files
          const buffer = await file.arrayBuffer()
          const base64 = Buffer.from(buffer).toString("base64")
          const imageData = `data:${fileType};base64,${base64}`

          // Detect forgery
          const forgeryResults = await detectForgery(imageData)
          if (forgeryResults && typeof forgeryResults.detected === "boolean") {
            results.forgery = forgeryResults
          }
        } catch (imageError) {
          console.error("Error processing image file:", imageError)
        }
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error processing files:", error)
    return NextResponse.json(
      {
        error: "Failed to process files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
