import { LandingHeader } from "@/components/landing-header"

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      <section className="pt-32 pb-24 md:pb-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-6">
            Our Products
          </p>
          <h2 className="font-serif text-3xl md:text-5xl italic leading-tight mb-6">
            Shop Glow
          </h2>
          <p className="text-sm text-neutral-400 max-w-xl mx-auto mb-16 uppercase tracking-wide">
            Premium wellness essentials for your daily glow-up.
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                name: "Glow Hair Serum",
                desc: "Lightweight hair oil for shine, softness, and repair.",
                price: "$38",
                img: "/products/hair-serum.jpg",
              },
              {
                name: "Glow Skin Serum",
                desc: "Vitamin C & hyaluronic acid face serum for radiance.",
                price: "$42",
                img: "/products/skin-serum.jpg",
              },
              {
                name: "Glow Body Oil",
                desc: "Hydrating shimmer body oil for an all-over glow.",
                price: "$36",
                img: "/products/body-oil.jpg",
              },
            ].map((product) => (
              <div
                key={product.name}
                className="group rounded-xl border border-neutral-200 overflow-hidden text-left hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-square overflow-hidden bg-neutral-100">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
                    {product.name}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {product.desc}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-serif text-neutral-900">
                      {product.price}
                    </span>
                    <button
                      disabled
                      className="h-9 px-5 rounded-full bg-neutral-100 text-neutral-400 text-xs uppercase tracking-wide font-medium cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-500">
          <span>Glow Beauty</span>
          <span>
            Cosmetic products only. Not intended to diagnose or treat any
            condition.
          </span>
        </div>
      </footer>
    </div>
  )
}
