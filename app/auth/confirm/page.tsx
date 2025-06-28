"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ConfirmPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token and type from URL parameters
        const token = searchParams.get("token")
        const type = searchParams.get("type")

        if (!token || !type) {
          setStatus("error")
          setMessage("Invalid confirmation link. Missing required parameters.")
          return
        }

        // Verify the email confirmation
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any,
        })

        if (error) {
          console.error("Email confirmation error:", error)
          setStatus("error")
          setMessage(error.message || "Failed to confirm email. Please try again.")
          return
        }

        if (data.user) {
          setStatus("success")
          setMessage("Email confirmed successfully! You can now sign in to your account.")

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push("/dashboard")
          }, 3000)
        } else {
          setStatus("error")
          setMessage("Email confirmation failed. Please try again.")
        }
      } catch (error) {
        console.error("Unexpected error during email confirmation:", error)
        setStatus("error")
        setMessage("An unexpected error occurred. Please try again.")
      }
    }

    handleEmailConfirmation()
  }, [searchParams, router])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Email Confirmation</CardTitle>
            <CardDescription>Confirming your email address...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {status === "loading" && (
              <div className="py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
                <p className="text-gray-600">Confirming your email...</p>
              </div>
            )}

            {status === "success" && (
              <div className="py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{message}</AlertDescription>
                </Alert>
                <p className="text-sm text-gray-600 mt-4">Redirecting to dashboard...</p>
              </div>
            )}

            {status === "error" && (
              <div className="py-8">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Button onClick={() => router.push("/auth")} className="w-full">
                    Go to Sign In
                  </Button>
                  <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
