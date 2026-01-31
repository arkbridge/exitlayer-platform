import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Nav */}
      <nav className="py-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Link href="/" className="text-lg font-medium text-[#1a1a1a] tracking-tight hover:text-[#2d4a2d] transition-colors">
            ExitLayer
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-[#e5e5e5] bg-[#f8f8f6]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between text-[#999] text-sm">
          <span>© 2025 ExitLayer</span>
          <a href="mailto:michael@exitlayer.io" className="hover:text-[#666] transition-colors">
            michael@exitlayer.io
          </a>
        </div>
      </footer>
    </div>
  )
}
