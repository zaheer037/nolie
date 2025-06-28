"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ProfileStats } from "@/components/profile-stats"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { updateProfile, setupStorage, changePassword } from "@/app/actions/profile-actions"
import {
  Camera,
  Save,
  User,
  Mail,
  Calendar,
  Shield,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Settings,
  Key,
  Trash2,
  Loader2,
} from "lucide-react"

interface ProfileData {
  id: string
  email: string
  full_name: string
  avatar_url: string
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)

  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
      return
    }

    if (user) {
      fetchProfile()
      setupStorage().catch(console.error)
    }
  }, [user, authLoading, router])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) {
        console.error("Error fetching profile:", error)
        setError("Failed to load profile data")
        return
      }

      setProfile(data)
      setFullName(data.full_name || "")
    } catch (error) {
      console.error("Error fetching profile:", error)
      setError("Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!user || !profile) return

    setSaving(true)
    setError(null)

    try {
      const formData = new FormData(event.currentTarget)

      // Add the full name
      formData.set("full_name", fullName)

      // Add the avatar file if selected
      if (selectedFile) {
        formData.set("avatar", selectedFile)
      }

      const result = await updateProfile(formData)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Update local state with the new profile data
      if (result.profile) {
        setProfile(result.profile)
      }

      // Clear file selection
      setSelectedFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })

      // Refresh the page to ensure everything is up to date
      router.refresh()
    } catch (error) {
      console.error("Error saving profile:", error)
      setError(error instanceof Error ? error.message : "Failed to save profile. Please try again.")
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save profile changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your new passwords match.",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setPasswordLoading(true)

    try {
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword)

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      })

      setShowPasswordDialog(false)
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Password change error:", error)
      toast({
        title: "Password Change Failed",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const deleteAccount = async () => {
    if (!user) return

    try {
      // In a real app, you'd want to implement proper account deletion
      // For now, we'll just sign out the user
      await supabase.auth.signOut()

      toast({
        title: "Account Deletion",
        description: "Account deletion feature will be implemented soon. You have been signed out.",
      })

      router.push("/")
    } catch (error) {
      console.error("Account deletion error:", error)
      toast({
        title: "Deletion Failed",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      })
    }
  }

  const clearFileSelection = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const getInitials = (name: string, email: string) => {
    if (name && name.trim()) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email.charAt(0).toUpperCase()
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="md:col-span-2">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-4">Unable to load your profile information.</p>
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  const hasChanges = fullName !== (profile.full_name || "") || selectedFile !== null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Verified Account
          </Badge>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form ref={formRef} onSubmit={handleProfileSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Picture & Basic Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Picture Card */}
              {/*<Card>
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Camera className="h-5 w-5" />
                    Profile Picture
                  </CardTitle>
                  <CardDescription>Upload a profile picture to personalize your account</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="relative inline-block">
                    <Avatar className="h-32 w-32 mx-auto border-4 border-white shadow-lg">
                      <AvatarImage
                        src={previewUrl || profile.avatar_url || "/placeholder.svg"}
                        alt={profile.full_name || profile.email}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                        {getInitials(profile.full_name || "", profile.email)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedFile && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                        onClick={clearFileSelection}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {saving && selectedFile && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <input
                        type="file"
                        id="avatar-upload"
                        name="avatar"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("avatar-upload")?.click()}
                        disabled={saving}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {selectedFile ? "Change Image" : "Upload Image"}
                      </Button>
                    </div>

                    {selectedFile && (
                      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Ready to upload</span>
                        </div>
                        <p className="text-xs">{selectedFile.name}</p>
                        <p className="text-xs">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF (max 5MB)</p>
                  </div>
                </CardContent>
              </Card>*/}

              {/* Account Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email Verified</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account Type</span>
                    <Badge variant="outline">Standard</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm font-medium">{new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Profile Form & Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        name="full_name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </Label>
                      <Input id="email" value={profile.email} disabled className="bg-gray-50 text-gray-500" />
                      <p className="text-xs text-gray-500">Email cannot be changed for security reasons</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Account Created
                      </Label>
                      <Input
                        value={new Date(profile.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        disabled
                        className="bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Last Updated
                      </Label>
                      <Input
                        value={new Date(profile.updated_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        disabled
                        className="bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>

                  {hasChanges && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        You have unsaved changes. Click "Save Changes" to update your profile.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={saving || !hasChanges}
                      className="bg-purple-900 hover:bg-purple-800 flex-1 md:flex-none"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>

                    {hasChanges && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFullName(profile.full_name || "")
                          clearFileSelection()
                        }}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Account Statistics */}
              <ProfileStats />

              {/* Security Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Security & Privacy
                  </CardTitle>
                  <CardDescription>Manage your account security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                        {/* <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Key className="h-5 w-5 text-gray-600" />
                            <h3 className="font-medium">Password</h3>
                          </div>
                          <p className="text-sm text-gray-600">Keep your account secure with a strong password</p>
                        </div> */}
                      {/* <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Change Password
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword">Current Password</Label>
                              <Input
                                id="currentPassword"
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) =>
                                  setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                                }
                                placeholder="Enter current password"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input
                                id="newPassword"
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                                placeholder="Enter new password"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Confirm New Password</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) =>
                                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                                }
                                placeholder="Confirm new password"
                              />
                            </div>
                            <div className="flex gap-3">
                              <Button onClick={handlePasswordChange} disabled={passwordLoading} className="flex-1">
                                {passwordLoading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Changing...
                                  </>
                                ) : (
                                  "Change Password"
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setShowPasswordDialog(false)}
                                disabled={passwordLoading}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog> */}
                    {/* </div> */}
                  {/* </div>  */}

                  <Separator />

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-medium text-red-900 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-700 mb-3">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Account</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete your account? This action cannot be undone and will
                            permanently remove all your data.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-3">
                          <Button variant="destructive" onClick={deleteAccount} className="flex-1">
                            Yes, Delete Account
                          </Button>
                          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
