import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f8f8f6] flex flex-col">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#0d1c18] via-emerald-950 to-[#0a1612] relative overflow-hidden">
        {/* Decorative blur elements */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 py-12 px-6">
          <div className="max-w-md mx-auto text-center">
            {/* Logo */}
            <Link href="/" className="inline-block mb-6">
              <span
                className="text-2xl font-serif font-medium tracking-tight"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 40%, rgba(167,243,208,0.85) 80%, rgba(110,231,183,0.7) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ExitLayer
              </span>
            </Link>

            {/* Tagline */}
            <p className="text-white/50 text-sm">
              Transform your agency into an acquisition-ready asset
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 py-12 -mt-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#e5e5e5] bg-[#f8f8f6]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between text-[#999] text-sm">
          <span>© 2026 ExitLayer</span>
          <a href="mailto:michael@exitlayer.io" className="hover:text-[#666] transition-colors">
            michael@exitlayer.io
          </a>
        </div>
      </footer>
    </div>
  )
}
