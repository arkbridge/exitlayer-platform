'use client'

interface DocumentUploadProps {
  uploadedDocuments: string[]
  onUploadClick?: () => void
}

const DOCUMENTS = [
  {
    id: 'services',
    emoji: '📋',
    name: 'Service Offerings Document',
    description: 'Your current services, pricing, and packages'
  },
  {
    id: 'deliverable',
    emoji: '📄',
    name: 'Sample Client Deliverable',
    description: 'A recent project or report you delivered'
  },
  {
    id: 'team',
    emoji: '👥',
    name: 'Team Structure / Org Chart',
    description: 'Who does what on your team'
  },
  {
    id: 'sops',
    emoji: '📝',
    name: 'Current SOPs (if any)',
    description: 'Any documented processes you have'
  }
]

export default function DocumentUpload({ uploadedDocuments, onUploadClick }: DocumentUploadProps) {
  const uploadedCount = uploadedDocuments.length
  const allUploaded = uploadedCount === DOCUMENTS.length

  // Badge color logic
  const getBadgeColor = () => {
    if (uploadedCount === 0) return 'bg-gray-100 text-gray-600'
    if (uploadedCount < DOCUMENTS.length) return 'bg-amber-50 text-amber-700 border border-amber-200'
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  }

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#e5e5e5]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl flex-shrink-0 shadow-lg shadow-orange-500/20">
              📁
            </div>

            {/* Title & Subtitle */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Upload Documents</h2>
              <p className="text-sm text-[#666]">Help us prepare your implementation plan</p>
            </div>
          </div>

          {/* Badge */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${getBadgeColor()}`}>
            {uploadedCount} of {DOCUMENTS.length} uploaded
          </div>
        </div>
      </div>

      {/* Document Grid */}
      <div className="p-6 grid md:grid-cols-2 gap-4">
        {DOCUMENTS.map((doc) => {
          const isUploaded = uploadedDocuments.includes(doc.id)

          return (
            <div
              key={doc.id}
              className={`
                relative p-5 rounded-lg border transition-all duration-300
                ${isUploaded
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-50/50 border-emerald-200 shadow-sm'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* Status Indicator */}
              {isUploaded && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {!isUploaded && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">
                  Missing
                </div>
              )}

              {/* Content */}
              <div className="flex items-start gap-3">
                {/* Emoji Icon */}
                <div className="text-3xl flex-shrink-0 mt-0.5">
                  {doc.emoji}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-1 leading-snug">
                    {doc.name}
                  </h3>
                  <p className="text-sm text-[#666] leading-relaxed">
                    {doc.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <button
          onClick={onUploadClick}
          className="
            w-full sm:w-auto px-6 py-3 rounded-lg
            bg-gradient-to-r from-orange-500 to-orange-600
            hover:from-orange-600 hover:to-orange-700
            text-white font-medium
            shadow-lg shadow-orange-500/30
            transition-all duration-200
            hover:scale-105 hover:shadow-xl hover:shadow-orange-500/40
            active:scale-100
          "
        >
          {allUploaded ? 'Manage Documents' : 'Upload Documents'}
        </button>

        <p className="text-sm text-[#666] text-center sm:text-left">
          {allUploaded
            ? 'All documents uploaded. You can update or add more anytime.'
            : 'Click to upload your documents securely. We accept PDF, DOCX, and common image formats.'
          }
        </p>
      </div>
    </div>
  )
}
