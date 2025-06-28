"use server"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Authentication error:", userError)
      return { success: false, error: "Authentication failed" }
    }

    // Get form data
    const fullName = formData.get("full_name") as string
    const avatarFile = formData.get("avatar") as File | null

    // Start with current profile data
    let avatarUrl: string | null = null

    // Get current profile
    const { data: profile } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).single()

    // If there's a new avatar file, upload it
    if (avatarFile && avatarFile.size > 0) {
      // Validate file type
      if (!avatarFile.type.startsWith("image/")) {
        return { success: false, error: "Invalid file type. Please upload an image." }
      }

      // Validate file size (5MB limit)
      if (avatarFile.size > 5 * 1024 * 1024) {
        return { success: false, error: "File too large. Please upload an image smaller than 5MB." }
      }

      // Create unique filename
      const fileExt = avatarFile.name.split(".").pop()
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return { success: false, error: `Upload failed: ${uploadError.message}` }
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName)

      avatarUrl = publicUrl
    }

    // Update profile in database
    const updateData: { full_name?: string; avatar_url?: string } = {}

    if (fullName) {
      updateData.full_name = fullName
    }

    if (avatarUrl) {
      updateData.avatar_url = avatarUrl
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Profile update error:", updateError)
      return { success: false, error: `Profile update failed: ${updateError.message}` }
    }

    // Revalidate the profile page
    revalidatePath("/profile")

    return {
      success: true,
      profile: updatedProfile,
      message: "Profile updated successfully",
    }
  } catch (error) {
    console.error("Profile update error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function setupStorage() {
  try {
    const supabase = await createClient()

    // Check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const avatarBucketExists = buckets?.some((bucket) => bucket.name === "avatars")

    // Create the bucket if it doesn't exist
    if (!avatarBucketExists) {
      const { error } = await supabase.storage.createBucket("avatars", {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })

      if (error) {
        console.error("Error creating bucket:", error)
        return { success: false, error: "Failed to create storage bucket" }
      }
    }

    // Update RLS policies
    // Note: This would typically be done via SQL migrations
    // For this example, we'll assume the policies are set up correctly

    return { success: true, message: "Storage setup complete" }
  } catch (error) {
    console.error("Storage setup error:", error)
    return { success: false, error: "Failed to set up storage" }
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error("Password change error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Password changed successfully" }
  } catch (error) {
    console.error("Password change error:", error)
    return { success: false, error: "Failed to change password" }
  }
}
