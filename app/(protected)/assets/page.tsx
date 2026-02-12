'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { REQUIRED_DOCUMENTS } from '@/lib/stage-utils'

interface Asset {
  id: string
  file_name: string
  file_type: string
  file_size: number
  category: string
  created_at: string
  storage_path: string
}

const CATEGORIES = [
  ...REQUIRED_DOCUMENTS.map(doc => ({
    id: doc.id,
    label: doc.name,
    icon: doc.icon,
    required: true,
    description: doc.description,
  })),
  { id: 'other', label: 'Other', icon: '📁', required: false, description: 'Any other relevant files' },
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('service_offerings')
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [documentsUploaded, setDocumentsUploaded] = useState<string[]>([])

  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)

        // Get submission ID
        const { data: submission } = await supabase
          .from('submissions')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (submission) {
          setSubmissionId(submission.id)
          fetchAssets(submission.id)
        }

        // Get current documents_uploaded from audit_sessions
        const { data: session } = await supabase
          .from('audit_sessions')
          .select('documents_uploaded')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (session?.documents_uploaded) {
          setDocumentsUploaded(session.documents_uploaded)
        }
      }
    }
    init()
  }, [])

  async function fetchAssets(subId: string) {
    const { data } = await supabase
      .from('client_assets')
      .select('*')
      .eq('submission_id', subId)
      .order('created_at', { ascending: false })

    if (data) {
      setAssets(data)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFiles(e.dataTransfer.files)
    }
  }, [userId, submissionId, selectedCategory])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFiles(e.target.files)
    }
  }

  async function updateDocumentsUploaded(category: string) {
    // Only track required document categories
    const isRequired = REQUIRED_DOCUMENTS.some(doc => doc.id === category)
    if (!isRequired || !userId) return

    const updated = [...new Set([...documentsUploaded, category])]
    setDocumentsUploaded(updated)

    // Update audit_sessions so stage progression works
    await supabase
      .from('audit_sessions')
      .update({
        documents_uploaded: updated,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
  }

  async function uploadFiles(files: FileList) {
    if (!userId || !submissionId) {
      setError('Please complete the questionnaire first')
      return
    }

    setUploading(true)
    setError(null)

    for (const file of Array.from(files)) {
      try {
        const storagePath = `${userId}/${submissionId}/${selectedCategory}/${file.name}`

        const { error: uploadError } = await supabase.storage
          .from('client-assets')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: true,
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          setError(`Failed to upload ${file.name}: ${uploadError.message}`)
          continue
        }

        const { error: dbError } = await supabase.from('client_assets').insert({
          submission_id: submissionId,
          user_id: userId,
          file_name: file.name,
          file_type: file.type || 'application/octet-stream',
          file_size: file.size,
          storage_path: storagePath,
          category: selectedCategory,
        })

        if (dbError) {
          console.error('DB error:', dbError)
          setError(`Failed to save record for ${file.name}`)
        } else {
          // Track required document upload for stage progression
          await updateDocumentsUploaded(selectedCategory)
        }
      } catch (err) {
        console.error('Error:', err)
        setError(`Error uploading ${file.name}`)
      }
    }

    setUploading(false)
    if (submissionId) {
      fetchAssets(submissionId)
    }
  }

  async function deleteAsset(asset: Asset) {
    if (!confirm(`Delete ${asset.file_name}?`)) return

    await supabase.storage.from('client-assets').remove([asset.storage_path])
    await supabase.from('client_assets').delete().eq('id', asset.id)

    // If deleting the last file in a required category, remove from documents_uploaded
    const isRequired = REQUIRED_DOCUMENTS.some(doc => doc.id === asset.category)
    if (isRequired && userId) {
      const remaining = assets.filter(a => a.category === asset.category && a.id !== asset.id)
      if (remaining.length === 0) {
        const updated = documentsUploaded.filter(d => d !== asset.category)
        setDocumentsUploaded(updated)
        await supabase
          .from('audit_sessions')
          .update({
            documents_uploaded: updated,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
      }
    }

    if (submissionId) {
      fetchAssets(submissionId)
    }
  }

  const assetsByCategory = CATEGORIES.map(cat => ({
    ...cat,
    assets: assets.filter(a => a.category === cat.id),
  }))

  const requiredCount = REQUIRED_DOCUMENTS.length
  const uploadedRequiredCount = REQUIRED_DOCUMENTS.filter(doc =>
    documentsUploaded.includes(doc.id)
  ).length

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-medium text-[#1a1a1a] mb-2">Upload Documents</h1>
        <p className="text-[#666]">
          Share your documents to help us build your custom systems.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-6 p-4 bg-white rounded-xl border border-[#e5e5e5]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#1a1a1a]">
            Required Documents
          </span>
          <span className="text-sm text-[#666]">
            {uploadedRequiredCount} of {requiredCount} uploaded
          </span>
        </div>
        <div className="w-full bg-[#f0f0ee] rounded-full h-2 mb-4">
          <div
            className="bg-emerald-800 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(uploadedRequiredCount / requiredCount) * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {REQUIRED_DOCUMENTS.map(doc => {
            const isUploaded = documentsUploaded.includes(doc.id)
            return (
              <div key={doc.id} className="flex items-center gap-2 text-sm">
                {isUploaded ? (
                  <svg className="w-4 h-4 text-emerald-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-[#ccc] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" strokeWidth={2} />
                  </svg>
                )}
                <span className={isUploaded ? 'text-[#1a1a1a]' : 'text-[#666]'}>
                  {doc.name}
                </span>
              </div>
            )
          })}
        </div>
        {uploadedRequiredCount === requiredCount && (
          <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <p className="text-sm text-emerald-800 font-medium">
              All required documents uploaded. You're ready to move forward!
            </p>
          </div>
        )}
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              selectedCategory === cat.id
                ? 'bg-emerald-900 text-white'
                : 'bg-white text-[#666] border border-[#e5e5e5] hover:border-[#ccc] hover:text-[#1a1a1a]'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Upload zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors mb-8 ${
          dragActive
            ? 'border-emerald-800 bg-emerald-900/5'
            : 'border-[#e5e5e5] hover:border-[#ccc]'
        }`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        <div className="pointer-events-none">
          <div className="w-16 h-16 mx-auto mb-4 bg-white border border-[#e5e5e5] rounded-xl flex items-center justify-center">
            {uploading ? (
              <svg className="w-8 h-8 text-emerald-800 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            )}
          </div>
          <p className="text-[#1a1a1a] font-medium mb-1">
            {uploading ? 'Uploading...' : 'Drop files here or click to browse'}
          </p>
          <p className="text-[#999] text-sm">
            Uploading to: {CATEGORIES.find(c => c.id === selectedCategory)?.label}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-[#a85454]">
          {error}
        </div>
      )}

      {/* Assets by category */}
      {assetsByCategory.some(c => c.assets.length > 0) ? (
        <div className="space-y-6">
          {assetsByCategory.filter(c => c.assets.length > 0).map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center gap-2">
                <span className="text-lg">{cat.icon}</span>
                <h3 className="font-medium text-[#1a1a1a]">{cat.label}</h3>
                <span className="text-[#999] text-sm">({cat.assets.length})</span>
              </div>
              <div className="divide-y divide-[#e5e5e5]">
                {cat.assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-[#f8f8f6] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#f8f8f6] border border-[#e5e5e5] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[#1a1a1a] font-medium">{asset.file_name}</p>
                        <p className="text-[#999] text-sm">
                          {formatFileSize(asset.file_size)} · {new Date(asset.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAsset(asset)}
                      className="p-2 text-[#999] hover:text-[#a85454] transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-[#999]">
          <p>No documents uploaded yet.</p>
          <p className="text-sm mt-1">Upload your required documents to get started.</p>
        </div>
      )}
    </div>
  )
}
