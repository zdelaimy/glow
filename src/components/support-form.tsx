"use client"

import { useState } from "react"

export function SupportForm() {
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      })
      setSubmitted(true)
      form.reset()
    } catch {
      setSubmitted(true)
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[#6E6A62] font-medium">Thank you!</p>
        <p className="text-xs text-[#6E6A62]/60">
          We&apos;ll get back to you shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-xs text-[#6E6A62]/50 underline hover:text-[#6E6A62]/70 transition-colors cursor-pointer"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <input
        name="name"
        type="text"
        required
        placeholder="Name"
        className="w-full px-3 py-2 text-xs bg-transparent border border-[#6E6A62]/30 text-[#6E6A62] placeholder:text-[#6E6A62]/40 outline-none focus:border-[#6E6A62]/60 transition-colors"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="w-full px-3 py-2 text-xs bg-transparent border border-[#6E6A62]/30 text-[#6E6A62] placeholder:text-[#6E6A62]/40 outline-none focus:border-[#6E6A62]/60 transition-colors"
      />
      <textarea
        name="message"
        required
        rows={3}
        placeholder="How can we help?"
        className="w-full px-3 py-2 text-xs bg-transparent border border-[#6E6A62]/30 text-[#6E6A62] placeholder:text-[#6E6A62]/40 outline-none focus:border-[#6E6A62]/60 transition-colors resize-none"
      />
      <button
        type="submit"
        disabled={sending}
        className="w-full py-2 text-xs uppercase tracking-[0.15em] font-medium text-white bg-[#6E6A62] hover:bg-[#5E5A52] disabled:opacity-50 transition-colors cursor-pointer font-inter"
      >
        {sending ? "Sending..." : "Submit"}
      </button>
    </form>
  )
}
