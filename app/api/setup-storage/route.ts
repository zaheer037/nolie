import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST() {
  try {
    // Create avatars bucket if it doesn't exist
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
    }

    const avatarBucket = buckets?.find((bucket) => bucket.name === "avatars")

    if (!avatarBucket) {
      const { data, error } = await supabaseAdmin.storage.createBucket("avatars", {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
        fileSizeLimit: 5242880, // 5MB
      })

      if (error) {
        console.error("Error creating bucket:", error)
        return NextResponse.json({ error: "Failed to create storage bucket" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, message: "Storage setup completed" })
  } catch (error) {
    console.error("Storage setup error:", error)
    return NextResponse.json({ error: "Storage setup failed" }, { status: 500 })
  }
}
