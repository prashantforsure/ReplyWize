"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, MessageSquare, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react"

interface Reply {
  id: string
  content: string
  mood: string
  isSelected: boolean
}

interface Conversation {
  id: string
  content: string
  sentiment: string
  replies: Reply[]
}

export default function ConversationPage({ params }: { params: { id: string } }) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingReply, setIsGeneratingReply] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      fetchConversation()
    }
  }, [status, params.id])

  const fetchConversation = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/conversation?id=${params.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch conversation")
      }
      const data = await response.json()
      setConversation(data)
    } catch (err) {
      setError("Failed to load conversation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const generateReply = async () => {
    if (!conversation) return

    setIsGeneratingReply(true)
    setError(null)
    try {
      const response = await fetch("/api/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conversationId: conversation.id }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate reply")
      }

      const newReply = await response.json()
      setConversation((prev) =>
        prev
          ? {
              ...prev,
              replies: [...prev.replies, newReply],
            }
          : null,
      )
    } catch (err) {
      setError("Failed to generate reply. Please try again.")
    } finally {
      setIsGeneratingReply(false)
    }
  }

  const handleReplyAction = async (replyId: string, action: "like" | "dislike") => {
    if (!conversation) return

    try {
      const response = await fetch(`/api/reply`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: replyId,
          isSelected: action === "like",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update reply")
      }

      setConversation((prev) => {
        if (!prev) return null
        return {
          ...prev,
          replies: prev.replies.map((reply) =>
            reply.id === replyId ? { ...reply, isSelected: action === "like" } : reply,
          ),
        }
      })
    } catch (err) {
      setError("Failed to update reply. Please try again.")
    }
  }

  if (status === "loading" || isLoading) {
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

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-600">Conversation not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Conversation</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Original Content</h2>
          <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">{conversation.content}</div>
          <p className="text-sm text-gray-500">Sentiment: {conversation.sentiment || "Not analyzed"}</p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-700">Replies</h2>
            <button
              onClick={generateReply}
              disabled={isGeneratingReply}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingReply ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 mr-2" />
              )}
              Generate New Reply
            </button>
          </div>
          {conversation.replies.length === 0 ? (
            <p className="text-gray-600">No replies yet. Generate one to get started!</p>
          ) : (
            <ul className="space-y-4">
              {conversation.replies.map((reply) => (
                <li key={reply.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <p className="text-gray-800 whitespace-pre-wrap">{reply.content}</p>
                      <p className="text-sm text-gray-500 mt-2">Mood: {reply.mood}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleReplyAction(reply.id, "like")}
                        className={`p-1 rounded-full ${
                          reply.isSelected ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                        } hover:bg-green-200`}
                      >
                        <ThumbsUp className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReplyAction(reply.id, "dislike")}
                        className={`p-1 rounded-full ${
                          reply.isSelected === false ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                        } hover:bg-red-200`}
                      >
                        <ThumbsDown className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

