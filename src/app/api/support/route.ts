import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const { error } = await supabase
      .from("support_requests")
      .insert({ name, email, message })

    if (error) {
      console.error("Supabase support_requests error:", error)
      return NextResponse.json({ error: "Failed to submit" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
