"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Mail, MapPin, Phone } from "lucide-react"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const FORM_ENDPOINT = "https://formspree.io/f/xvgrzrkk"; // Replace with actual endpoint

    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      }),
    });

    if (response.ok) {
      alert("Thank you for your message! We will get back to you soon.");

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } else {
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive", // if you're using shadcn/ui toast variants
      });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "An unexpected error occurred.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-10 text-center">Contact Us</h1>

      <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
          <p className="text-gray-600 mb-8">
            Have questions about NoLie AI? Want to learn more about our services or request a demo? Fill out the form
            and our team will get back to you as soon as possible.
          </p>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Email</h3>
                <p className="text-gray-600 mt-1">projectnolie24@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Phone className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Phone</h3>
                <p className="text-gray-600 mt-1">+91 9876543210</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Address</h3>
                <p className="text-gray-600 mt-1">
                  BITM campus
                  <br />
                  Ballari City, KA 583101
                  <br />
                  India
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
            <CardDescription>Fill out the form below and we'll respond as soon as possible</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Message subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Your message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-purple-900 hover:bg-purple-800" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
