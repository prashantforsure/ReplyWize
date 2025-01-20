import { GoogleGenerativeAI } from "@google/generative-ai"
import Tesseract from "tesseract.js"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
export async function performOCR(imageData: string): Promise<string> {
    try{
        const worker = await Tesseract.createWorker("eng")
        const result = await worker.recognize(imageData)
        await worker.terminate()
        return result.data.text
    }catch(error){
        console.error("Error performing OCR:", error)
    throw new Error("Failed to perform OCR")
    }
}
export async function generateAIReply(conversationContent: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })
      const prompt = `Given the following conversation, generate an appropriate reply:
  
      ${conversationContent}
  
      Reply:`
  
      const result = await model.generateContent(prompt)
      const response = result.response
      return response.text()
    } catch (error) {
      console.error("Error generating AI reply:", error)
      throw new Error("Failed to generate AI reply")
    }
  }