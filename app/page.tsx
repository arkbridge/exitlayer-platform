import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-white font-semibold text-xl">ExitLayer</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Free Agency Diagnostic
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Stop Trading Time<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            for Revenue
          </span>
        </h1>

        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Discover exactly how much owner dependency is costing your agency.
          Get a personalized roadmap to systems that scale without you.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Take the Free Diagnostic
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href="mailto:michael@exitlayer.io"
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
          >
            Book a Call
          </a>
        </div>
      </div>

      {/* What You'll Get */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          What You'll Discover
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4">
              <span className="text-2xl">💸</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Your Owner Tax</h3>
            <p className="text-gray-400">
              Calculate exactly how much you're losing per year to tasks below your pay grade.
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Exit Value Gap</h3>
            <p className="text-gray-400">
              See the difference between your current exit multiple and where you could be.
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🗺️</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Your Roadmap</h3>
            <p className="text-gray-400">
              Get a prioritized list of systems to build that will reclaim your time and increase enterprise value.
            </p>
          </div>
        </div>
      </div>

      {/* The Problem */}
      <div className="bg-gray-900/30 border-y border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            The Inefficiency Cascade
          </h2>
          <p className="text-gray-400 text-center text-lg mb-12 max-w-2xl mx-auto">
            Most agency owners are trapped in a doom loop. Each problem feeds the next,
            compounding into millions in lost exit value.
          </p>

          <div className="space-y-4">
            {[
              { num: 1, text: 'No documentation means you can\'t delegate' },
              { num: 2, text: 'Stuck in delivery means no time for systems' },
              { num: 3, text: 'No systems means revenue is capped at your hours' },
              { num: 4, text: 'Owner-dependent revenue means lower exit multiples' },
            ].map((item) => (
              <div key={item.num} className="flex items-center gap-4 bg-gray-900/50 rounded-xl p-5 border border-gray-800">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  {item.num}
                </div>
                <p className="text-gray-300 text-lg">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Break the Loop
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">
          Ready to See Your Score?
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
          Takes 5-10 minutes. You'll get an instant score plus a personalized analysis of your agency's transformation potential.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all text-lg"
        >
          Start Your Free Diagnostic
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-gray-500 text-sm">© 2025 ExitLayer</span>
          </div>
          <a
            href="mailto:michael@exitlayer.io"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            michael@exitlayer.io
          </a>
        </div>
      </footer>
    </div>
  )
}
