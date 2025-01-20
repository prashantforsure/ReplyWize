"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Upload, X, Loader2, Send } from "lucide-react"
import Image from "next/image"

export default function Page() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
    setPreview(null)
    setExtractedText("")
  }

  const handleExtractText = async () => {
    if (!image) return

    setIsProcessing(true)
    setError(null)

    const formData = new FormData()
    formData.append("image", image)

    try {
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to process image")
      }

      const data = await response.json()
      setExtractedText(data.text)
    } catch (err) {
      setError("Failed to extract text from image. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateConversation = async () => {
    if (!extractedText) return

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: extractedText }),
      })

      if (!response.ok) {
        throw new Error("Failed to create conversation")
      }

      const data = await response.json()
      router.push(`/conversation/${data.id}`)
    } catch (err) {
      setError("Failed to create conversation. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/api/auth/signin")
    return null
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">New Conversation</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-700">Upload Image</h2>
          <p className="text-sm text-gray-500">Upload a screenshot of your conversation to get started.</p>
        </div>
        {!image ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
            <label
              htmlFor="image-upload"
              className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Image
            </label>
          </div>
        ) : (
          <div className="relative">
            <Image
              src={preview! || "/placeholder.svg"}
              alt="Uploaded conversation"
              width={600}
              height={400}
              className="rounded-lg object-cover"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
        {image && !extractedText && (
          <button
            onClick={handleExtractText}
            disabled={isProcessing}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Extract Text"}
          </button>
        )}
        {extractedText && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Extracted Text</h3>
            <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">{extractedText}</div>
            <button
              onClick={handleCreateConversation}
              disabled={isProcessing}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Create Conversation
                </>
              )}
            </button>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

