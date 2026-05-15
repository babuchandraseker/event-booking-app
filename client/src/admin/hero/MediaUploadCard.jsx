import { useRef, useState } from 'react'
import AdminGlassCard from './AdminGlassCard.jsx'

export default function MediaUploadCard({
  label,
  description,
  accept,
  disabled,
  progress,
  error,
  onPickFile,
  onClear,
  currentLabel,
}) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const busy = typeof progress === 'number' && progress > 0 && progress < 100

  return (
    <AdminGlassCard
      style={{
        padding: '14px 16px',
        outline: isDragging ? '2px dashed rgba(201,168,76,0.55)' : 'none',
        outlineOffset: 2,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {label}
          </div>
          {description && (
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>{description}</div>
          )}
          {currentLabel && (
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8, wordBreak: 'break-all' }}>
              Current: <span style={{ color: 'var(--text-primary)' }}>{currentLabel}</span>
            </div>
          )}
          {error && <div style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>{error}</div>}
          {typeof progress === 'number' && progress > 0 && progress < 100 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-4)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #c9a84c, #6b4fb8)', transition: 'width 0.2s ease' }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Uploading… {progress}%</div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            style={{ display: 'none' }}
            disabled={disabled || busy}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onPickFile(f)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => inputRef.current?.click()}
            style={btnPrimary}
          >
            Upload
          </button>
          <button type="button" disabled={disabled || busy} onClick={onClear} style={btnGhost}>
            Remove
          </button>
        </div>
      </div>
      <div
        onDragEnter={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          const f = e.dataTransfer.files?.[0]
          if (f && !disabled && !busy) onPickFile(f)
        }}
        style={{
          marginTop: 12,
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed rgba(201,168,76,0.25)',
          padding: '10px 12px',
          fontSize: 11,
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}
      >
        Drop file here or use Upload — MP4 / WebM for video; JPG / PNG / WebP / GIF for poster
      </div>
    </AdminGlassCard>
  )
}

const btnPrimary = {
  background: 'linear-gradient(135deg, rgba(201,168,76,0.95), rgba(107, 79, 184, 0.85))',
  color: '#0a0612',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 14px',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const btnGhost = {
  background: 'transparent',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 14px',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
}
