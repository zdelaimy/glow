'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface MediaUploadProps {
  projectId: string | null
  onUploaded: (asset: { id: string; file_name: string; file_type: string; storage_path: string }) => void
  onClear: () => void
  currentAsset: { id: string; file_name: string; file_type: string } | null
}

export function MediaUpload({ projectId, onUploaded, onClear, currentAsset }: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Use JPEG, PNG, WebP, GIF, MP4, MOV, or WebM.')
      return
    }

    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError(`File too large. Max ${isVideo ? '100MB' : '10MB'}.`)
      return
    }

    // Preview
    const url = URL.createObjectURL(file)
    setPreview(url)

    if (!projectId) {
      // Store file locally until project is created — will be uploaded during generate/analyze
      onUploaded({ id: 'pending', file_name: file.name, file_type: file.type, storage_path: '' })
      return
    }

    setUploading(true)
    setProgress(20)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)

      setProgress(50)
      const res = await fetch('/api/ai-studio/upload', { method: 'POST', body: formData })
      setProgress(80)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const { asset } = await res.json()
      setProgress(100)
      onUploaded(asset)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }, [projectId, onUploaded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleClear = () => {
    setPreview(null)
    setError(null)
    setProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClear()
  }

  if (currentAsset || preview) {
    const isVideo = currentAsset?.file_type?.startsWith('video/') || false
    return (
      <div className="relative rounded-xl border border-[#6E6A62]/10 overflow-hidden bg-[#f5f0eb]/50">
        <button
          onClick={handleClear}
          className="absolute top-2 right-2 z-10 bg-white/90 rounded-full p-1.5 hover:bg-white transition-colors"
        >
          <X className="w-4 h-4 text-[#6E6A62]" />
        </button>
        {preview && !isVideo && (
          <img src={preview} alt="Upload preview" className="w-full h-48 object-cover" />
        )}
        {preview && isVideo && (
          <video src={preview} className="w-full h-48 object-cover" controls />
        )}
        {!preview && currentAsset && (
          <div className="h-48 flex items-center justify-center gap-2 text-[#6E6A62]/60">
            {isVideo ? <Video className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            <span className="text-sm">{currentAsset.file_name}</span>
          </div>
        )}
        {uploading && (
          <div className="px-4 py-2">
            <Progress value={progress} className="h-1" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-[#6E6A62] bg-[#6E6A62]/5'
            : 'border-[#6E6A62]/20 hover:border-[#6E6A62]/40'
        }`}
      >
        <Upload className="w-8 h-8 mx-auto mb-3 text-[#6E6A62]/40" />
        <p className="text-sm text-[#6E6A62]/60">
          Drag & drop or <span className="underline">browse</span>
        </p>
        <p className="text-xs text-[#6E6A62]/40 mt-1">
          Images up to 10MB, videos up to 100MB
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  )
}
