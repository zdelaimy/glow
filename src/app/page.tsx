"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { LandingHeader } from "@/components/landing-header"
import { Footer } from "@/components/footer"
import { useCart } from "@/contexts/cart-context"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/types/database"
import { ShoppingBag, Check, Star, Shield, FlaskConical, Award, Leaf } from "lucide-react"
import { ProductReviews } from "@/components/product-reviews"
import { BeforeAfterSlider } from "@/components/before-after-slider"

/* ── stacked gallery images (left column, scrollable) ── */
const GALLERY_IMAGES = [
  { src: "/shop/serum2.png", alt: "Glow Serum bottle" },
  { src: "/stri/vitaminc.png", alt: "Vitamin C technology" },
  { src: "/stri/woman.png", alt: "Woman with radiant skin" },
  { src: "/stri/how to use.png", alt: "How to use Glow Serum" },
  { src: "/stri/addroutine.png", alt: "Add to your routine" },
]

const TRUST_BADGES = [
  { icon: Shield, label: "Dermatologist Tested" },
  { icon: FlaskConical, label: "Backed by Science" },
  { icon: Award, label: "Award Winning" },
  { icon: Leaf, label: "Clean Ingredients" },
]

const KEY_INGREDIENTS = [
  {
    name: "15% Vitamin C",
    description: "A potent brightening antioxidant that fades dark spots, evens skin tone, and protects against free radical damage.",
  },
  {
    name: "Niacinamide (B3)",
    description: "Strengthens the skin barrier, minimizes pores, reduces redness, and improves overall texture for a smoother complexion.",
  },
  {
    name: "Hyaluronic Acid",
    description: "A powerful humectant that holds 1000x its weight in water, delivering deep hydration and plumping fine lines from within.",
  },
]

/* ── components ──────────────────────────────────────── */

function ProductGallery() {
  return (
    <div className="flex flex-col gap-1">
      {GALLERY_IMAGES.map((img, i) => (
        <div key={i} className="relative w-full overflow-hidden border-b border-neutral-100">
          <Image
            src={img.src}
            alt={img.alt}
            width={1200}
            height={1200}
            className="w-full h-auto"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  )
}

function AddToBagButton({ product }: { product: Product | null }) {
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  function handleAdd() {
    if (!product) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAdd}
      disabled={!product}
      className={`w-full h-14 rounded-xl text-sm uppercase tracking-[0.15em] font-semibold transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer ${
        added
          ? "bg-green-600 text-white"
          : "bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] disabled:opacity-50"
      }`}
    >
      {added ? (
        <><Check className="w-5 h-5" /> Added to Bag</>
      ) : (
        <><ShoppingBag className="w-4.5 h-4.5" /> Add to Bag</>
      )}
    </button>
  )
}

function FeedbackForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements.namedItem("feedback") as HTMLTextAreaElement
    const message = input.value.trim()
    if (!message) return

    setStatus("sending")
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      if (!res.ok) throw new Error()
      setStatus("sent")
      input.value = ""
    } catch {
      setStatus("error")
    }
  }

  if (status === "sent") {
    return (
      <div className="max-w-md mx-auto text-center">
        <p className="text-sm text-neutral-600">Thanks for your feedback! We&apos;ll keep it in mind.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto text-left">
      <label htmlFor="feedback" className="block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-3">
        What types of products would you like to see Glow make?
      </label>
      <textarea
        id="feedback"
        name="feedback"
        rows={3}
        placeholder="e.g. body lotion, lip gloss, SPF moisturizer..."
        className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-400 resize-none"
      />
      {status === "error" && <p className="mt-2 text-xs text-red-500">Something went wrong. Please try again.</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-4 h-11 px-8 rounded-lg bg-neutral-950 text-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Submit"}
      </button>
    </form>
  )
}

/* ── main page ───────────────────────────────────────── */

export default function HomePage() {
  const [glowSerum, setGlowSerum] = useState<Product | null>(null)
  const [comingSoonProducts, setComingSoonProducts] = useState<Product[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("sort_order")
      if (!data) return
      const serum = data.find((p) => p.slug === "glow-serum") || data[0]
      const rest = data.filter((p) => p.id !== serum?.id)
      setGlowSerum(serum || null)
      setComingSoonProducts(rest)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader variant="light" ctaHref="/become-a-glow-girl" ctaLabel="Become a Glow Girl" />

      {/* ── Trust Marquee (fixed below header) ───────── */}
      <div className="fixed top-[72px] left-0 right-0 z-40 bg-[#faf8f5] border-b border-neutral-100 py-[9px] overflow-hidden whitespace-nowrap">
        <div className="inline-flex animate-[marquee_30s_linear_infinite]">
          {[...Array(3)].map((_, i) => (
            <span key={i} className="text-[10px] uppercase tracking-[0.18em] text-[#6E6A62]/70 font-medium font-inter leading-none">
              Dermatologist Tested&ensp;&bull;&ensp;Clinically Proven&ensp;&bull;&ensp;Paraben-Free&ensp;&bull;&ensp;Sulfate-Free&ensp;&bull;&ensp;Cruelty-Free&ensp;&bull;&ensp;Vegan&ensp;&bull;&ensp;Award Winning&ensp;&bull;&ensp;Backed by Science&ensp;&bull;&ensp;
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero PDP Section ─────────────────────────── */}
      <section className="pt-[130px] md:pt-[140px] pb-16 md:pb-24">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Left — Stacked scrollable images */}
          <div>
            <ProductGallery />
          </div>

          {/* Right — Product info (sticky) */}
          <div className="md:sticky md:top-[112px] md:self-start space-y-6 px-6 md:pr-10 md:pl-2 pt-6 md:pt-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-2 font-inter">
                  Bestseller
                </p>
                <h1 className="text-3xl md:text-4xl leading-tight text-neutral-900 mb-2">
                  Glow Serum
                </h1>
                <p className="text-base text-neutral-500 leading-relaxed">
                  Vitamin C & hyaluronic radiance serum. A potent brightening serum for glass-skin radiance and visibly faded dark spots.
                </p>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <a href="#reviews" className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-700 transition-colors">4.8 (54 reviews)</a>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-medium text-neutral-900">
                  {glowSerum ? `$${(glowSerum.price_cents / 100).toFixed(0)}.00` : "$80.00"}
                </span>
                <span className="text-sm text-neutral-400 line-through">$112.00</span>
              </div>

              {/* Trust badges — inline */}
              <div className="grid grid-cols-2 gap-3">
                {TRUST_BADGES.map((badge) => (
                  <div key={badge.label} className="flex items-center gap-2.5 bg-[#faf8f5] rounded-lg px-3.5 py-2.5">
                    <badge.icon className="w-4 h-4 text-[#6E6A62] shrink-0" />
                    <span className="text-xs text-neutral-600 font-medium">{badge.label}</span>
                  </div>
                ))}
              </div>

              {/* Add to bag */}
              <AddToBagButton product={glowSerum} />

              {/* Key details */}
              <div className="border-t border-neutral-100 pt-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Free shipping on orders over $75
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  30-day money-back guarantee
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Cruelty-free & vegan
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* ── Key Ingredients ──────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 mb-4 font-inter">
              What&apos;s Inside
            </p>
            <h2 className="text-3xl md:text-4xl leading-tight text-neutral-900">
              Powered by science, not trends.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {KEY_INGREDIENTS.map((ing) => (
              <div key={ing.name} className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#faf8f5] border border-neutral-100 flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-[#6E6A62]" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-800 font-sans">
                  {ing.name}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto">
                  {ing.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Clinical Results ─────────────────────────── */}
      <section className="relative overflow-hidden">
        <Image
          src="/stri/improvement.png"
          alt="Clinical improvement results"
          width={1920}
          height={1080}
          className="w-full h-auto block"
          sizes="100vw"
        />
      </section>

      {/* ── Before and After ────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 mb-4 font-inter">
              Real Results
            </p>
            <h2 className="text-3xl md:text-4xl leading-tight text-neutral-900">
              Before &amp; After
            </h2>
          </div>
          <BeforeAfterSlider
            beforeSrc="/stri/before-slider2.png"
            afterSrc="/stri/after-slider2.png"
          />
        </div>
      </section>

      {/* ── Key Ingredients (image cards) ────────────── */}
      <section className="py-20 md:py-28 bg-[#faf8f5]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 mb-4 font-inter">
              What&apos;s Inside
            </p>
            <h2 className="text-3xl md:text-4xl leading-tight text-neutral-900">
              Key Ingredients
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                src: "/stri/vitaminc1.png",
                name: "Vitamin C",
                description: "An antioxidant that visibly brightens & restores radiance to dull skin while firming & smoothing the appearance of fine lines.",
              },
              {
                src: "/stri/acerolacherry.png",
                name: "Acerola Cherry",
                description: "Highly concentrated source of pure Vitamin C that visibly brightens, firms and restores radiance.",
              },
              {
                src: "/stri/retinol.png",
                name: "Retinol",
                description: "Reduces the look of deep wrinkles, restores firmness & elasticity, refines texture & the look of pores.",
              },
            ].map((ing) => (
              <div key={ing.name} className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/60">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={ing.src}
                    alt={ing.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5 space-y-1.5">
                  <h3 className="text-base text-neutral-900">{ing.name}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{ing.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ────────────────────────────────── */}
      <ProductReviews />

      {/* ── Coming Soon Products ─────────────────────── */}
      {comingSoonProducts.length > 0 && (
        <section className="bg-[#faf8f5] py-20 md:py-28">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 mb-4 font-inter">
                Coming Soon
              </p>
              <h2 className="text-3xl md:text-4xl leading-tight text-neutral-900">
                The collection is growing.
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {comingSoonProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-neutral-200/60">
                  <div className="relative aspect-[3/4] bg-[#f5f0eb]">
                    {product.image_url && (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover opacity-80"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-white/90 backdrop-blur-sm text-neutral-700 text-xs uppercase tracking-[0.2em] font-medium px-6 py-2.5 rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-neutral-900">{product.name}</h3>
                    <p className="text-[13px] text-neutral-400 mt-1">{product.tagline}</p>
                    <p className="text-sm text-neutral-900 mt-2">${(product.price_cents / 100).toFixed(0)}.00</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Feedback ─────────────────────────────────── */}
      <section className="py-20 md:py-28 border-t border-neutral-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl italic mb-10 text-neutral-900">
            We&apos;re always working on what&apos;s next. Tell us what you want to see.
          </h2>
          <FeedbackForm />
        </div>
      </section>

      {/* ── Study Footnotes ─────────────────────────── */}
      <div className="bg-neutral-50 border-t border-neutral-100 px-6 py-5">
        <div className="max-w-5xl mx-auto space-y-1">
          <p className="text-[10px] text-neutral-400 leading-relaxed">*Based on expert grading evaluation on 35 subjects at 6 weeks</p>
          <p className="text-[10px] text-neutral-400 leading-relaxed">&dagger;Based on instrumental testing on 35 subjects at 6 weeks</p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
