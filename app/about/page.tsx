import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About NoLie AI</h1>

        <div className="prose max-w-none">
          <p className="text-lg text-gray-700 mb-8">
            NoLie AI is an advanced artificial intelligence-powered platform designed to ensure the authenticity,
            integrity, and privacy of digital content. It provides a unified solution for detecting text plagiarism,
            identifying document forgery, and preventing privacy leaks in a single, user-friendly system.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            In the digital age, the rise of online content has increased the risks of plagiarism, document forgery, and
            unauthorized exposure of personal data. Our mission is to address these challenges by leveraging AI-powered
            techniques to detect text and image plagiarism, identify document forgery, and protect sensitive
            information, ensuring trust and security in digital content usage.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">Technology</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <Card>
              <CardHeader>
                <CardTitle>Text Analysis</CardTitle>
                <CardDescription>Natural Language Processing</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  We employ cutting-edge Natural Language Processing (NLP) techniques and BERT models for advanced text
                  analysis, enabling accurate plagiarism detection and semantic understanding.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Image Analysis</CardTitle>
                <CardDescription>Convolutional Neural Networks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Our system uses Convolutional Neural Networks (CNN) and Error Level Analysis (ELA) for detecting image
                  tampering and document forgery at the pixel level.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy Protection</CardTitle>
                <CardDescription>Named Entity Recognition</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  We implement Named Entity Recognition (NER) and pattern matching algorithms to identify and protect
                  personally identifiable information (PII).
                </p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-semibold mt-10 mb-4">Key Features</h2>
          <ul className="space-y-4 mb-10">
            {[
              "Advanced plagiarism detection with semantic understanding",
              "Document forgery identification using metadata and pixel-level analysis",
              "Privacy leak prevention through PII detection",
              "Comprehensive visual reports with detailed insights",
              "Secure, user-friendly interface for content submission and analysis",
              "Support for multiple file formats (text, images, PDFs)",
              "Fast analysis with results in under 5 seconds",
            ].map((feature, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-4">Applications</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium mb-3">Academic Institutions</h3>
              <p className="text-gray-700">
                Universities and schools can use NoLie AI to verify student submissions, ensure academic integrity, and
                prevent plagiarism.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium mb-3">Media & Publishing</h3>
              <p className="text-gray-700">
                News outlets and publishers can verify content authenticity, detect manipulated images, and ensure
                original reporting.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium mb-3">Legal & Cybersecurity</h3>
              <p className="text-gray-700">
                Law firms and security companies can verify document authenticity and protect sensitive client
                information.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium mb-3">Government & Administration</h3>
              <p className="text-gray-700">
                Government agencies can verify official documents, detect forgeries, and ensure compliance with privacy
                regulations.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-10 mb-4">Future Enhancements</h2>
          <p className="text-gray-700 mb-6">We are continuously improving NoLie AI with upcoming features including:</p>
          <ul className="space-y-2 mb-10">
            {[
              "Mobile application for on-the-go content verification",
              "Enhanced AI-based pattern detection for more accurate forgery identification",
              "Expanded multilingual and regional language support",
              "Integration with learning management systems and content management platforms",
              "Advanced privacy-first design with improved PII detection capabilities",
            ].map((enhancement, index) => (
              <li key={index} className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>{enhancement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
