'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { type ExitLayerScore, getScoreColor, getOverallInterpretation } from '@/lib/score-calculator';

interface ClientData {
  metadata: {
    clientName: string;
    contactName: string;
    contactEmail: string;
    submissionDate: string;
    overallScore: number;
  };
  score: ExitLayerScore;
}

export default function ClientPortal() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClientData() {
      try {
        const response = await fetch(`/api/portal/${clientId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Client not found. Please check your link.');
          } else if (response.status === 401) {
            setError('Please sign in to view this portal.');
          } else if (response.status === 403) {
            setError('You do not have access to this client portal.');
          } else {
            setError('Failed to load your data. Please try again.');
          }
          return;
        }
        const data = await response.json();
        setClientData(data);
      } catch (err) {
        setError('Failed to load your data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your diagnostic...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Oops!</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <a
            href="mailto:michael@exitlayer.io"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  if (!clientData) return null;

  const { metadata, score } = clientData;
  const overallColor = getScoreColor(score.overall);
  const submissionDate = new Date(metadata.submissionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="font-semibold text-slate-900">ExitLayer Portal</h1>
                <p className="text-xs text-slate-500">{metadata.clientName}</p>
              </div>
            </div>
            <div className="text-right text-sm text-slate-500">
              Submitted {submissionDate}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {metadata.contactName?.split(' ')[0] || 'there'}!</h2>
          <p className="text-slate-300 mb-6">
            Here's your Agency Diagnostic summary. Michael will reach out within 7-10 days to discuss your personalized transformation roadmap.
          </p>

          {/* Score Summary */}
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={overallColor}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(score.overall / 100) * 283} 283`}
                  style={{ filter: `drop-shadow(0 0 10px ${overallColor}40)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold" style={{ color: overallColor }}>
                  {score.overall}
                </span>
                <span className="text-xs text-slate-400">of 100</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Your ExitLayer Score</h3>
              <p className="text-slate-400 text-sm mb-4">{getOverallInterpretation(score.overall)}</p>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Primary Constraint:</span>
                  <span className="ml-2 text-red-400">{score.analysis.primaryConstraint.dimension}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Your Journey</h3>
          <div className="space-y-4">
            <TimelineItem
              status="complete"
              title="Diagnostic Submitted"
              description="Your questionnaire has been received"
              date={submissionDate}
            />
            <TimelineItem
              status="current"
              title="Analysis in Progress"
              description="Michael is reviewing your responses and building your roadmap"
            />
            <TimelineItem
              status="upcoming"
              title="Implementation Call"
              description="A 1-hour deep dive to map your systems and define the build plan"
            />
            <TimelineItem
              status="upcoming"
              title="Sprint Kickoff"
              description="Begin your 4-week transformation sprint"
            />
          </div>
        </div>

        {/* Dimension Scores */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Score Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { key: 'leverage', label: 'Leverage', score: score.dimensions.leverage },
              { key: 'equityPotential', label: 'Equity Potential', score: score.dimensions.equityPotential },
              { key: 'revenueRisk', label: 'Revenue Risk', score: score.dimensions.revenueRisk },
              { key: 'productReadiness', label: 'Product Ready', score: score.dimensions.productReadiness },
              { key: 'implementationCapacity', label: 'Capacity', score: score.dimensions.implementationCapacity },
            ].map((dim) => (
              <div key={dim.key} className="text-center p-4 bg-slate-50 rounded-xl">
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ color: getScoreColor(dim.score) }}
                >
                  {dim.score}
                </div>
                <div className="text-xs text-slate-500">{dim.label}</div>
                <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${dim.score}%`,
                      backgroundColor: getScoreColor(dim.score),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Wins Preview */}
        {score.analysis.quickWins.length > 0 && (
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 mb-8">
            <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Wins Preview
            </h3>
            <ul className="space-y-2">
              {score.analysis.quickWins.slice(0, 3).map((win, i) => (
                <li key={i} className="flex items-start gap-2 text-emerald-800">
                  <svg className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {win}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Steps CTA */}
        <div className="bg-blue-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Questions Before Your Call?</h3>
          <p className="text-blue-100 mb-6">
            Reach out anytime. Michael typically responds within 24 hours.
          </p>
          <a
            href="mailto:michael@exitlayer.io"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Michael
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12 py-6">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} ExitLayer. Your data is confidential and secure.</p>
        </div>
      </footer>
    </div>
  );
}

function TimelineItem({ status, title, description, date }: {
  status: 'complete' | 'current' | 'upcoming';
  title: string;
  description: string;
  date?: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          status === 'complete'
            ? 'bg-emerald-500'
            : status === 'current'
            ? 'bg-blue-500 animate-pulse'
            : 'bg-slate-200'
        }`}>
          {status === 'complete' ? (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : status === 'current' ? (
            <div className="w-2 h-2 bg-white rounded-full" />
          ) : (
            <div className="w-2 h-2 bg-slate-400 rounded-full" />
          )}
        </div>
        <div className={`w-0.5 flex-1 mt-2 ${status === 'upcoming' ? 'bg-slate-200' : 'bg-emerald-200'}`} />
      </div>
      <div className="pb-8">
        <h4 className={`font-semibold ${status === 'upcoming' ? 'text-slate-400' : 'text-slate-900'}`}>
          {title}
        </h4>
        <p className={`text-sm ${status === 'upcoming' ? 'text-slate-400' : 'text-slate-600'}`}>
          {description}
        </p>
        {date && <p className="text-xs text-slate-400 mt-1">{date}</p>}
      </div>
    </div>
  );
}
