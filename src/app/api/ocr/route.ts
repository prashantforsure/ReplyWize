import { NextResponse } from "next/server"
import { performOCR } from "@/lib/ai-utils"
import { getServerSession } from "next-auth"
import { authoptions } from "@/lib/auth/auth"

export async function POST(request: Request) {
  
  const session = await getServerSession(authoptions)
  if(!session?.user?.id){
  return NextResponse.json({
      message: "unauth"
  }, {status:500})

  }
  try {
    const body = await request.json()
    const { image } = body

    if (!image) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 })
    }

    const extractedText = await performOCR(image)

    return NextResponse.json({ text: extractedText })
  } catch (error) {
    console.error("Error processing OCR:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

