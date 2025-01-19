import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request : Request){
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

const aiReply = await genereateAIReply(conversation.content);
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

