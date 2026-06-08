import type { Metadata } from 'next'
import MarketingHome from './marketing-home'

export const metadata: Metadata = {
  title: 'ExitLayer — Business Aerodynamics',
  description: "Half the work in your business doesn't need a person doing it anymore. I find the drag, build the system, and install it without breaking what works.",
  openGraph: {
    title: 'ExitLayer — Business Aerodynamics',
    description: "Half the work in your business doesn't need a person doing it anymore.",
    url: 'https://www.exitlayer.io',
    siteName: 'ExitLayer',
    type: 'website',
  },
}

export default function Page() {
  return <MarketingHome />
}
