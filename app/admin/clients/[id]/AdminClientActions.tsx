'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'New' },
  { value: 'review', label: 'In Review' },
  { value: 'call_scheduled', label: 'Call Scheduled' },
  { value: 'call_complete', label: 'Call Complete' },
  { value: 'building', label: 'Building' },
  { value: 'complete', label: 'Complete' },
]

interface AdminNote {
  id: string
  content: string
  note_type: string | null
  created_at: string
}

export default function AdminClientActions({
  submissionId,
  currentStatus,
  existingNotes,
}: {
  submissionId: string
  currentStatus: string
  existingNotes: AdminNote[]
}) {
  const router = useRouter()
  const supabase = createClient()

  const [status, setStatus] = useState(currentStatus)
  const [updating, setUpdating] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [notes, setNotes] = useState(existingNotes)

  async function updateStatus(newStatus: string) {
    setUpdating(true)
    try {
      // Update submission status
      await supabase
        .from('submissions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', submissionId)

      // Add pipeline stage record
      await supabase.from('pipeline_stages').insert({
        submission_id: submissionId,
        stage: newStatus,
        notes: `Status changed to ${newStatus}`,
        completed_at: new Date().toISOString(),
      })

      setStatus(newStatus)
      router.refresh()
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(false)
    }
  }

  async function addNote() {
    if (!newNote.trim()) return

    setAddingNote(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('admin_notes')
        .insert({
          submission_id: submissionId,
          content: newNote.trim(),
          note_type: 'general',
          created_by: user?.id,
        })
        .select()
        .single()

      if (data) {
        setNotes([data, ...notes])
        setNewNote('')
      }
    } catch (error) {
      console.error('Error adding note:', error)
    } finally {
      setAddingNote(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Update */}
      <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
        <h3 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Update Status</h3>
        <div className="space-y-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => updateStatus(option.value)}
              disabled={updating || status === option.value}
              className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                status === option.value
                  ? 'bg-emerald-900 text-white'
                  : 'bg-[#f8f8f6] text-[#666] hover:bg-[#e5e5e5] hover:text-[#1a1a1a]'
              } disabled:opacity-50`}
            >
              {option.label}
              {status === option.value && (
                <span className="float-right">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Add Note */}
      <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
        <h3 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Admin Notes</h3>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          rows={3}
          className="w-full px-4 py-3 bg-[#f8f8f6] border border-[#e5e5e5] rounded-lg text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-emerald-700 resize-none mb-3"
        />
        <button
          onClick={addNote}
          disabled={addingNote || !newNote.trim()}
          className="w-full px-4 py-2 bg-emerald-900 hover:bg-emerald-950 disabled:bg-emerald-900/50 text-white font-medium rounded-full transition-colors"
        >
          {addingNote ? 'Adding...' : 'Add Note'}
        </button>

        {notes.length > 0 && (
          <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
            {notes.map((note) => (
              <div key={note.id} className="p-3 bg-[#f8f8f6] rounded-lg border border-[#e5e5e5]">
                <p className="text-[#1a1a1a] text-sm">{note.content}</p>
                <p className="text-[#999] text-xs mt-1">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
