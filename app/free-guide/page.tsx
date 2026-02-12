export default function FreeGuidePage() {
  return (
    <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        <div className="mb-8">
          <a href="/" className="text-lg font-medium text-[#1a1a1a] tracking-tight">
            ExitLayer
          </a>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e5e5] p-10">
          <div className="w-14 h-14 rounded-full bg-emerald-900/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          <h1 className="text-2xl font-serif font-medium text-[#1a1a1a] mb-3">
            Your free guide is on the way.
          </h1>
          <p className="text-[#666] mb-8 leading-relaxed">
            We&apos;ll send the Agency Growth Playbook to the email you provided.
            It covers what to focus on to get to $300K+ and build a team that
            runs without you.
          </p>

          <div className="p-4 bg-[#f8f8f6] rounded-lg border border-[#e5e5e5] text-left mb-6">
            <p className="text-sm font-medium text-[#1a1a1a] mb-2">What&apos;s inside:</p>
            <ul className="text-sm text-[#666] space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-emerald-800 mt-0.5">&#10003;</span>
                The 3 systems every agency needs before $500K
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-800 mt-0.5">&#10003;</span>
                How to make your first hire without breaking the bank
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-800 mt-0.5">&#10003;</span>
                Moving from project-based to recurring revenue
              </li>
            </ul>
          </div>

          <p className="text-[#999] text-sm">
            When you&apos;re past $300K with a team in place,{' '}
            <a href="/questionnaire" className="text-emerald-800 hover:underline">
              retake the assessment
            </a>
            {' '}and we&apos;ll build your exit roadmap.
          </p>
        </div>
      </div>
    </div>
  )
}
