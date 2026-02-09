import { useState } from 'react'
import { X, Download, Loader2 } from 'lucide-react'

/**
 * FEAT-51: Export Project Modal
 *
 * Confirmation modal shown before downloading a .tar.gz of the project
 * from the VPS. Shows what's included/excluded, handles download with spinner.
 */
export default function ExportModal({ project, open, onClose }) {
  const [downloading, setDownloading] = useState(false)

  if (!open) return null

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 120000)
      try {
        const res = await fetch(`/api/projects/${project.id}/export`, {
          signal: controller.signal
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: 'Export failed' }))
          throw new Error(err.detail || 'Export failed')
        }
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${project.slug || project.name}-export.tar.gz`
        a.click()
        URL.revokeObjectURL(url)
        onClose()
      } finally {
        clearTimeout(timeout)
      }
    } catch (err) {
      console.error('Export failed:', err)
      alert(`Export failed: ${err.message}`)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          width: '520px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>
            Export Project
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 16px' }}>
            This will download a <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>.tar.gz</code> of your entire project folder from the VPS.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              What's included:
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li><code>src/</code> — Your application source code</li>
              <li><code>CLAUDE.md</code> — AI engineer instructions</li>
              <li><code>.claude/</code> — Claude commands (generate-prp, execute-prp, audit-index)</li>
              <li><code>harness/</code> — Feature queue, codebase index, learnings</li>
              <li><code>PRPs/</code> — Product Requirement Packs</li>
              <li><code>docs/</code> — Project documentation</li>
              <li><code>.git/</code> — Full git history</li>
            </ul>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              What's NOT included:
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li><code>node_modules/</code>, <code>__pycache__/</code>, <code>.venv/</code> — reinstall with your package manager</li>
              <li><code>.env</code> files are included if present — review before sharing</li>
            </ul>
          </div>

          <p style={{
            margin: 0,
            padding: '10px 12px',
            background: 'var(--bg-tertiary)',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}>
            A <code>PORTABLE_README.md</code> is included with instructions for using this project with any LLM coding assistant.
          </p>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          padding: '16px 20px',
          borderTop: '1px solid var(--border)'
        }}>
          <button
            onClick={onClose}
            disabled={downloading}
            style={{
              padding: '8px 16px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              cursor: downloading ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              opacity: downloading ? 0.5 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              padding: '8px 16px',
              background: 'var(--primary)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: downloading ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: downloading ? 0.8 : 1
            }}
          >
            {downloading ? (
              <>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Downloading...
              </>
            ) : (
              <>
                <Download size={14} />
                Download .tar.gz
              </>
            )}
          </button>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
