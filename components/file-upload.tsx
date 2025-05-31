"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, X } from "lucide-react"

interface FileUploadProps {
  onUpload: (file: File) => void
  onRemove?: () => void
  accept?: string
  currentImage?: string | null
  className?: string
  buttonText?: string
}

export function FileUpload({
  onUpload,
  onRemove,
  accept = "image/*",
  currentImage,
  className = "",
  buttonText = "Upload Image",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // Create a preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
      setIsUploading(false)
      onUpload(file)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setPreview(null)
    if (onRemove) onRemove()
  }

  return (
    <div className={`relative ${className}`}>
      {(preview || currentImage) && (
        <div className="relative mb-4 overflow-hidden rounded-md">
          <img src={preview || currentImage || ""} alt="Preview" className="h-full w-full object-cover" />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute right-2 top-2 h-8 w-8 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-center justify-center">
        <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:bg-gray-100">
          {isUploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
          ) : (
            <>
              <Upload className="mb-2 h-10 w-10 text-gray-400" />
              <p className="mb-2 text-sm font-semibold text-gray-700">{buttonText}</p>
              <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 2MB)</p>
            </>
          )}
          <input type="file" className="hidden" onChange={handleFileChange} accept={accept} disabled={isUploading} />
        </label>
      </div>
    </div>
  )
}
