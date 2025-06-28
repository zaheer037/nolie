import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileCheck, FileWarning, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">NoLie AI</h1>
            <p className="text-2xl mb-8">Hunting Plagiarism, Detecting Forgery, and Protecting Privacy</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-purple-900 hover:bg-gray-100">
                <Link href="/dashboard">
                  Try NoLie AI <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-purple-900 hover:bg-white/10">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Our Core Features</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-800 mb-6">
                <FileCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Plagiarism Detection</h3>
              <p className="text-gray-600">
                Advanced NLP techniques to identify both exact and semantic plagiarism in text documents with high
                accuracy.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-800 mb-6">
                <FileWarning className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Forgery Detection</h3>
              <p className="text-gray-600">
                CNN-powered analysis to detect tampered images and documents through pixel-level examination and
                metadata analysis.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-800 mb-6">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Privacy Protection</h3>
              <p className="text-gray-600">
                Identify potential privacy leaks by scanning for personal identifiable information (PII) in your
                documents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How NoLie AI Works</h2>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-8 top-0 h-full w-0.5 bg-purple-200"></div>
              {[
                {
                  step: 1,
                  title: "Upload Your Content",
                  description: "Upload text, images, or PDF documents through our secure interface.",
                },
                {
                  step: 2,
                  title: "AI-Powered Analysis",
                  description:
                    "Our advanced AI algorithms analyze your content for plagiarism, forgery, and privacy issues.",
                },
                {
                  step: 3,
                  title: "Detailed Reports",
                  description: "Receive comprehensive visual reports highlighting potential risks and issues.",
                },
                {
                  step: 4,
                  title: "Take Action",
                  description: "Use our insights to improve content integrity and protect sensitive information.",
                },
              ].map((item, index) => (
                <div key={index} className="relative flex items-start mb-12">
                  <div className="absolute left-8 -translate-x-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-sm">
                    {item.step}
                  </div>
                  <div className="ml-12">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-purple-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Ensure Content Integrity?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start using NoLie AI today to detect plagiarism, identify forgery, and protect privacy in your digital
            content.
          </p>
          <Button asChild size="lg" className="bg-white text-purple-900 hover:bg-gray-100">
            <Link href="/dashboard">Get Started Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">NoLie AI</h3>
              <p className="text-gray-400">
                Advanced AI-powered platform for ensuring the authenticity, integrity, and privacy of digital content.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">
                Email: info@nolieai.com
                <br />
                Phone: +1 (555) 123-4567
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} NoLie AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
