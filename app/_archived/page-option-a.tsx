import Link from 'next/link'

export default function OptionA() {
  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Nav */}
      <nav className="py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <span className="text-lg font-medium text-[#1a1a1a] tracking-tight">ExitLayer</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[#666] hover:text-[#1a1a1a] text-sm transition-colors">
              Sign in
            </Link>
            <Link
              href="/questionnaire"
              className="px-5 py-2 bg-emerald-900 text-white rounded-full text-sm font-medium hover:bg-emerald-950 transition-colors"
            >
              Get Your Exit Price
            </Link>
          </div>
        </div>
      </nav>

      {/* Sales Letter */}
      <article className="max-w-2xl mx-auto px-6 pt-20 pb-32">
        <div className="leading-loose text-[#444]">
          <h1 className="text-5xl md:text-6xl font-serif font-medium text-[#1a1a1a] leading-[1.1] mb-12">
            Your agency isn't worth what you think it is.
          </h1>

          <p className="mb-6">
            You built something real. Revenue coming in. Clients who trust you. Work you're proud of.
          </p>

          <p className="mb-6">
            But the thing you built — it can't be sold.
          </p>

          <p className="mb-6">
            Not because the work isn't good. Because the work is <em>you</em>.
          </p>

          <p className="mb-10">
            Every delivery decision, every client relationship, every process that matters — it runs through your brain. You're not running an agency. You're running yourself at scale.
          </p>

          <p className="mb-6 text-[#1a1a1a] font-medium text-lg">
            And that makes it worthless to an acquirer.
          </p>

          <div className="my-16 border-l-4 border-red-500/20 pl-6 py-2">
            <p className="text-[#555] italic">
              When you take a week off, revenue stalls.
            </p>
          </div>

          <p className="mb-6">
            You already know this.
          </p>

          <p className="mb-6">
            When a client asks a question, they don't email the team. They email you.
          </p>

          <p className="mb-6">
            When pricing gets discussed, there's no documented framework. You just <em>know</em> what to charge because you've done it a hundred times.
          </p>

          <p className="mb-6">
            When something breaks in delivery, your team doesn't have a system to reference. They slack you.
          </p>

          <p className="mb-10">
            The entire operation — the thing generating six or seven figures a year — lives inside your head.
          </p>

          <p className="mb-6 text-[#1a1a1a] font-medium text-lg">
            None of it transfers in a sale.
          </p>

          <div className="my-16 border-l-4 border-red-500/20 pl-6 py-2">
            <p className="text-[#555] italic">
              Your processes, pricing, delivery logic — all of it evaporates the moment you walk away.
            </p>
          </div>

          <p className="mb-6">
            And here's what kills the valuation even more:
          </p>

          <p className="mb-6">
            Your revenue model resets to zero every month. Project fees, one-off engagements, campaigns that end. No retainers. No recurring. Every quarter is a scramble to replace what just rolled off.
          </p>

          <p className="mb-10">
            An acquirer looks at that and sees chaos.
          </p>

          <p className="mb-6">
            Then there's concentration risk.
          </p>

          <p className="mb-6">
            If your biggest client leaves tomorrow, you take a critical hit. Maybe 30% of revenue gone overnight. Maybe more.
          </p>

          <p className="mb-10">
            Acquirers don't buy businesses held together by one or two relationships.
          </p>

          <p className="mb-6 text-[#1a1a1a] font-medium text-lg">
            And the final nail: you don't own anything proprietary.
          </p>

          <div className="my-16 border-l-4 border-red-500/20 pl-6 py-2">
            <p className="text-[#555] italic">
              You use the same tools, same ads platforms, same playbooks as every other agency.
            </p>
          </div>

          <p className="mb-6">
            There's nothing <em>yours</em>. No framework, no IP, no mechanism that creates equity.
          </p>

          <p className="mb-10">
            Without that, an acquirer isn't buying a business. They're buying a consulting gig with your face on it.
          </p>

          <p className="mb-6">
            So what happens when you try to exit?
          </p>

          <p className="mb-10 text-lg text-[#1a1a1a]">
            You get offered 1-2x SDE. Maybe less.
          </p>

          <p className="mb-6">
            That's the multiple for a <strong>job</strong>, not a business.
          </p>

          <p className="mb-16">
            And you take it — or you don't sell at all.
          </p>

          <div className="my-20 text-center">
            <div className="inline-block w-12 h-px bg-[#e5e5e5]" />
          </div>

          <p className="mb-10 text-2xl text-[#1a1a1a] leading-relaxed">
            Here's what most agency owners don't realize:
          </p>

          <p className="mb-6">
            Two agencies, same revenue, same client roster, same profit margin.
          </p>

          <p className="mb-10">
            One sells for 1.5x. The other sells for 4x.
          </p>

          <p className="mb-6 text-[#1a1a1a] font-medium text-lg">
            The difference isn't what they do. It's whether the owner is required to do it.
          </p>

          <p className="mb-6">
            In one agency, the revenue is generated by <em>systems</em>. Documented processes, clear workflows, automated delivery, proprietary tools.
          </p>

          <p className="mb-6">
            The owner could leave for six months and the business would run.
          </p>

          <p className="mb-10">
            In the other agency, the revenue is generated by <em>the owner</em>. Their expertise, their decisions, their relationships.
          </p>

          <p className="mb-6">
            The owner leaves for a week and things start falling apart.
          </p>

          <p className="mb-16">
            Same top line. Wildly different exit price.
          </p>

          <p className="mb-6">
            The acquirer isn't paying for revenue. They're paying for revenue <em>that doesn't need you</em>.
          </p>

          <p className="mb-6">
            If the machine stops when you leave, they're not buying a machine.
          </p>

          <p className="mb-10 text-lg text-[#1a1a1a]">
            They're buying a liability.
          </p>

          <div className="my-20 text-center">
            <div className="inline-block w-12 h-px bg-[#e5e5e5]" />
          </div>

          <p className="mb-6">
            So what do you do?
          </p>

          <p className="mb-10">
            You extract yourself from the operation. You turn the logic in your head into systems that run without you. You build something proprietary — a framework, a tool, a methodology — that creates equity.
          </p>

          <p className="mb-6 text-[#1a1a1a] font-medium text-lg">
            That's what ExitLayer does.
          </p>

          <p className="mb-6">
            We don't optimize your marketing or scale your revenue. That's not the problem.
          </p>

          <p className="mb-10">
            We make your agency sellable.
          </p>

          <p className="mb-6">
            We come in and extract the processes living in your head. We document them. We systematize them. We turn them into SOPs, automations, and workflows that your team can run without texting you.
          </p>

          <p className="mb-10">
            Then we find your key mechanism — the thing that makes your delivery actually work — and we turn it into intellectual property.
          </p>

          <p className="mb-6">
            A productized framework. A proprietary tool. A system that has your name on it.
          </p>

          <p className="mb-10">
            That's what an acquirer pays a premium for.
          </p>

          <p className="mb-6">
            After that, your multiple doesn't stay at 1-2x.
          </p>

          <p className="mb-16 text-lg text-[#1a1a1a]">
            It goes to 3-5x. Sometimes higher.
          </p>

          <p className="mb-6">
            Same revenue. Same clients. Same market.
          </p>

          <p className="mb-10">
            The only thing that changed: now there's something to buy.
          </p>

          <div className="my-20 text-center">
            <div className="inline-block w-12 h-px bg-[#e5e5e5]" />
          </div>

          <p className="mb-10 text-2xl text-[#1a1a1a] leading-relaxed">
            The first step is knowing what you're worth right now.
          </p>

          <p className="mb-6">
            Not what you think it's worth. What an acquirer would actually pay.
          </p>

          <p className="mb-10">
            We built a 14-question valuation tool that calculates your current exit price and shows you exactly what's suppressing it.
          </p>

          <p className="mb-6">
            It takes two minutes.
          </p>

          <p className="mb-6">
            You'll see your valuation, your current multiple, and the exact gaps between where you are and where you need to be to command a premium.
          </p>

          <p className="mb-16">
            Then you'll know what needs to be fixed.
          </p>

          <div className="my-16">
            <div className="text-center">
              <Link
                href="/questionnaire"
                className="inline-flex items-center gap-2 px-10 py-5 bg-emerald-900 text-white rounded-full font-medium hover:bg-emerald-950 transition-colors text-lg"
              >
                Get Your Exit Price
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <p className="text-[#999] text-sm mt-4">14 questions · 2 minutes · Instant valuation</p>
            </div>
          </div>

          <p className="text-[#666] text-sm italic text-center mt-20">
            No signup. No sales call. Just the number.
          </p>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-[#e5e5e5]">
        <div className="max-w-5xl mx-auto px-6 py-10 flex items-center justify-between text-[#999] text-sm">
          <span>© 2026 ExitLayer</span>
          <a href="mailto:michael@exitlayer.io" className="hover:text-[#666] transition-colors">
            michael@exitlayer.io
          </a>
        </div>
      </footer>
    </div>
  )
}
