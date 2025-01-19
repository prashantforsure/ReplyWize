import { authoptions } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

async function generateAIReply(conversationContent: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return "";
  }
  

export async function GET(request : Request){
const session = await getServerSession(authoptions)
if(!session?.user?.id){
return NextResponse
}

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if(!conversationId){
        return NextResponse.json({
            error: "conversation Id  not found"
        },{
            status: 400
        })
    }
    try{
        const replies = await prisma.reply.findMany({
            where: {
                conversationId
            }
        })
    }catch (error){
        console.error('error while fetching the data', error)
        return NextResponse.json({
            error: "something went wrong"
        }, {
            status: 500
        })
    }
}

export async function POST(request: Request){
    try{
    const body = await request.json();
const { conversationId, content } =  body; 

if(!conversationId || !content){
    return NextResponse.json({
        error:"conversationId or context is missing"
    }, {
        status: 400
    })
}
const conversation = await prisma.conversation.findUnique({
    where: {
        id: conversationId
    }
})
if(!conversation){
    
    return NextResponse.json({
        error: "there was no conversation found"
    })
}

const aiReply = await generateAIReply(conversation.content);
const newReply = await prisma.reply.create({
    data: {
      conversationId,
      content: aiReply,
      mood: 'neutral',
    },
  });
  return NextResponse.json({
    newReply
  }, {
    status: 200
  })
}catch(error) {
console.error('something went wrong', error)
return NextResponse.json({
    error: "something went wrong"
}, {
 status: 500
})
}
}

export async function PUT(request: Request){
try{
    const body = await request.json()
    const { mood, content, id, isSelected } = body;
    const updatedReply = await prisma.reply.update({
        where: { id },
        data: {
          content,
          mood,
          isSelected,
        },
    })
    return NextResponse.json(updatedReply);

} catch(error){
    console.error("error while updating reply", error)
    return NextResponse.json({
        message: "internal sever error"
    }, {
        status: 500
    })
}}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
    const id = searchParams.get('conversationId');

    if(!id){
        return NextResponse.json({

        })
    }
    await prisma.reply.delete({
        where: { id },
    })
   return NextResponse.json({
    message: "reply has been deleted successfully"
   })
    }catch(error){
        console.error('there is some error', error)
        return NextResponse.json({
            error : 'internal server error'
        }, {
            status: 500
        })
    }
}