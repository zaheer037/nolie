import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: NextRequest) {
  try {
    const { document1, document2 } = await request.json()

    if (!document1 || !document2) {
      return NextResponse.json({ error: "Two documents are required for comparison" }, { status: 400 })
    }

    // Use Gemini to compare the documents
    const { text: result } = await generateText({
      model: google("gemini-1.5-flash"), // Updated model name
      prompt: `Compare these two documents and identify similarities, differences, and potential plagiarism.
      Provide a detailed analysis of how similar they are and highlight any matching sections.
      
      Document 1:
      ${document1.substring(0, 1000)}
      
      Document 2:
      ${document2.substring(0, 1000)}
      
      Return a JSON object with:
      {
        "similarityScore": 0.75,
        "matchedSections": [
          {
            "doc1Text": "text from document 1",
            "doc2Text": "corresponding text from document 2",
            "similarity": 0.92,
            "startPos1": 120,
            "endPos1": 180,
            "startPos2": 95,
            "endPos2": 155
          }
        ],
        "summary": "Overall assessment of the comparison",
        "verdict": "High similarity detected"
      }`,
    })

    // Clean the response to ensure it's valid JSON
    const cleanedResult = result
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()
    const comparisonResults = JSON.parse(cleanedResult)
    return NextResponse.json(comparisonResults)
  } catch (error) {
    console.error("Error comparing documents:", error)
    return NextResponse.json({ error: "Failed to compare documents" }, { status: 500 })
  }
}
