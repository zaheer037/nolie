"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload } from "lucide-react"
import type { FileType } from "@/lib/types"

interface FileUploaderProps {
  onFilesUploaded: (files: FileType[]) => void
}

export function FileUploader({ onFilesUploaded }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      }))
      onFilesUploaded(filesArray)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      }))
      onFilesUploaded(filesArray)

      // Reset the input value so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center ${
        isDragging ? "border-purple-500 bg-purple-50" : "border-gray-300"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        multiple
        accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png"
      />

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-3 rounded-full bg-purple-100">
          <Upload className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <p className="text-sm font-medium">
            Drag and drop files here, or{" "}
            <button
              type="button"
              onClick={triggerFileInput}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-gray-500 mt-1">Supports: TXT, PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
        </div>
      </div>
    </div>
  )
}
