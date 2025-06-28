import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: NextRequest) {
  try {
    const { results, fileName, analysisDate } = await request.json()

    if (!results) {
      return NextResponse.json({ error: "No analysis results provided" }, { status: 400 })
    }

    // Generate a comprehensive report using AI
    const { text: reportContent } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `Generate a comprehensive analysis report based on the following results:

Analysis Results:
- Plagiarism Score: ${results.plagiarism.score}
- Plagiarism Matches: ${JSON.stringify(results.plagiarism.matches)}
- Forgery Detected: ${results.forgery.detected}
- Forgery Confidence: ${results.forgery.confidence}
- Privacy Issues Detected: ${results.privacy.detected}
- Privacy Entities: ${JSON.stringify(results.privacy.entities)}

File Name: ${fileName || "Unknown"}
Analysis Date: ${analysisDate || new Date().toISOString()}

Create a detailed professional report with:
1. Executive Summary
2. Detailed Findings
3. Risk Assessment
4. Recommendations
5. Technical Details

Format as HTML with proper styling for a professional document.`,
    })

    // Generate PDF-style HTML report
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>NoLie AI Analysis Report</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #7c3aed;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 10px;
        }
        .report-title {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 5px;
        }
        .report-date {
            color: #6b7280;
            font-size: 14px;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            border-left: 4px solid #7c3aed;
            background: #f9fafb;
        }
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
        }
        .risk-high { color: #dc2626; }
        .risk-medium { color: #d97706; }
        .risk-low { color: #059669; }
        .score-box {
            display: inline-block;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: bold;
            margin: 10px 0;
        }
        .score-high { background: #fee2e2; color: #dc2626; }
        .score-medium { background: #fef3c7; color: #d97706; }
        .score-low { background: #d1fae5; color: #059669; }
        .findings-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        .finding-card {
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            text-align: center;
        }
        .finding-value {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .finding-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
        }
        .matches-list {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        .match-item {
            padding: 10px;
            border-bottom: 1px solid #f3f4f6;
            margin-bottom: 10px;
        }
        .match-text {
            font-style: italic;
            color: #374151;
            margin-bottom: 5px;
        }
        .match-source {
            font-size: 12px;
            color: #6b7280;
        }
        .privacy-entities {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        .entity-item {
            display: inline-block;
            background: #fef2f2;
            color: #dc2626;
            padding: 5px 10px;
            border-radius: 4px;
            margin: 5px;
            font-size: 12px;
        }
        .recommendations {
            background: #eff6ff;
            border: 1px solid #dbeafe;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">NoLie AI</div>
        <div class="report-title">Content Analysis Report</div>
        <div class="report-date">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
        <div class="report-date">File: ${fileName || "Unknown"}</div>
    </div>

    <div class="section">
        <div class="section-title">Executive Summary</div>
        <div class="findings-grid">
            <div class="finding-card">
                <div class="finding-value ${getPlagiarismClass(results.plagiarism.score)}">${Math.round(results.plagiarism.score * 100)}%</div>
                <div class="finding-label">Plagiarism Score</div>
            </div>
            <div class="finding-card">
                <div class="finding-value ${results.forgery.detected ? "risk-high" : "risk-low"}">${results.forgery.detected ? "DETECTED" : "CLEAN"}</div>
                <div class="finding-label">Forgery Status</div>
            </div>
            <div class="finding-card">
                <div class="finding-value ${results.privacy.detected ? "risk-high" : "risk-low"}">${results.privacy.entities.length}</div>
                <div class="finding-label">Privacy Issues</div>
            </div>
        </div>
        
        <div class="score-box ${getPlagiarismScoreClass(results.plagiarism.score)}">
            Overall Risk Level: ${getOverallRisk(results)}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Plagiarism Analysis</div>
        <p><strong>Originality Score:</strong> ${Math.round((1 - results.plagiarism.score) * 100)}%</p>
        <p><strong>Plagiarism Score:</strong> ${Math.round(results.plagiarism.score * 100)}%</p>
        
        ${
          results.plagiarism.matches.length > 0
            ? `
        <div class="matches-list">
            <strong>Detected Matches:</strong>
            ${results.plagiarism.matches
              .map(
                (match) => `
                <div class="match-item">
                    <div class="match-text">"${match.text}"</div>
                    <div class="match-source">Source: ${match.source} (${Math.round(match.similarity * 100)}% similarity)</div>
                </div>
            `,
              )
              .join("")}
        </div>
        `
            : "<p>No plagiarism matches detected.</p>"
        }
    </div>

    <div class="section">
        <div class="section-title">Document Forgery Analysis</div>
        <p><strong>Forgery Status:</strong> ${results.forgery.detected ? "DETECTED" : "NOT DETECTED"}</p>
        <p><strong>Confidence Level:</strong> ${Math.round(results.forgery.confidence * 100)}%</p>
        ${
          results.forgery.detected
            ? `
            <div class="recommendations">
                <strong>⚠️ Warning:</strong> This document shows signs of potential manipulation or forgery. 
                Further investigation is recommended.
            </div>
        `
            : `
            <div class="recommendations">
                <strong>✅ Clean:</strong> No signs of document forgery or manipulation detected.
            </div>
        `
        }
    </div>

    <div class="section">
        <div class="section-title">Privacy Analysis</div>
        <p><strong>Privacy Issues Detected:</strong> ${results.privacy.detected ? "YES" : "NO"}</p>
        <p><strong>Total PII Entities Found:</strong> ${results.privacy.entities.length}</p>
        
        ${
          results.privacy.entities.length > 0
            ? `
        <div class="privacy-entities">
            <strong>Detected Personal Information:</strong><br>
            ${results.privacy.entities
              .map(
                (entity) => `
                <span class="entity-item">${entity.type}: ${entity.text}</span>
            `,
              )
              .join("")}
        </div>
        <div class="recommendations">
            <strong>⚠️ Privacy Risk:</strong> Personal identifiable information (PII) was detected. 
            Consider removing or redacting sensitive information before sharing.
        </div>
        `
            : `
        <div class="recommendations">
            <strong>✅ Privacy Safe:</strong> No personal identifiable information detected.
        </div>
        `
        }
    </div>

    <div class="section">
        <div class="section-title">Recommendations</div>
        ${generateRecommendations(results)}
    </div>

    <div class="section">
        <div class="section-title">Technical Details</div>
        <p><strong>Analysis Engine:</strong> NoLie AI v1.0</p>
        <p><strong>AI Model:</strong> Google Gemini 1.5 Flash</p>
        <p><strong>Analysis Date:</strong> ${analysisDate || new Date().toISOString()}</p>
        <p><strong>Report ID:</strong> ${generateReportId()}</p>
    </div>

    <div class="footer">
        <p>This report was generated by NoLie AI - Advanced Content Integrity Analysis</p>
        <p>© ${new Date().getFullYear()} NoLie AI. All rights reserved.</p>
    </div>
</body>
</html>`

    return NextResponse.json({
      success: true,
      reportHtml: htmlReport,
      reportId: generateReportId(),
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

function getPlagiarismClass(score: number): string {
  if (score > 0.3) return "risk-high"
  if (score > 0.1) return "risk-medium"
  return "risk-low"
}

function getPlagiarismScoreClass(score: number): string {
  if (score > 0.3) return "score-high"
  if (score > 0.1) return "score-medium"
  return "score-low"
}

function getOverallRisk(results: any): string {
  const plagiarismHigh = results.plagiarism.score > 0.3
  const forgeryDetected = results.forgery.detected
  const privacyIssues = results.privacy.detected

  if (plagiarismHigh || forgeryDetected || privacyIssues) return "HIGH"
  if (results.plagiarism.score > 0.1) return "MEDIUM"
  return "LOW"
}

function generateRecommendations(results: any): string {
  const recommendations = []

  if (results.plagiarism.score > 0.3) {
    recommendations.push(
      "• <strong>High Plagiarism:</strong> Significant portions of text appear to be copied. Rewrite or properly cite sources.",
    )
  } else if (results.plagiarism.score > 0.1) {
    recommendations.push(
      "• <strong>Moderate Plagiarism:</strong> Some similarities detected. Review and cite sources appropriately.",
    )
  } else {
    recommendations.push(
      "• <strong>Original Content:</strong> Content appears to be original with minimal similarity to known sources.",
    )
  }

  if (results.forgery.detected) {
    recommendations.push(
      "• <strong>Document Verification:</strong> Signs of manipulation detected. Verify document authenticity through alternative means.",
    )
  }

  if (results.privacy.detected) {
    recommendations.push(
      "• <strong>Privacy Protection:</strong> Remove or redact personal information before sharing publicly.",
    )
    recommendations.push(
      "• <strong>Compliance Check:</strong> Ensure compliance with data protection regulations (GDPR, CCPA, etc.).",
    )
  }

  recommendations.push(
    "• <strong>Regular Monitoring:</strong> Implement regular content integrity checks for ongoing protection.",
  )

  return recommendations.join("<br>")
}

function generateReportId(): string {
  return `NL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}
