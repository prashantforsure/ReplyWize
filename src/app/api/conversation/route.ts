import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request){
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try{
       if(id){
        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include : { replies: true },
        })
        if(!conversation){
            return NextResponse.json({
                error: "there was no conversation available"
            }, {
                status: 500
            })
        }
        return NextResponse.json(conversation);
       }
       
    } catch(error){
        console.log('error fetching conversation', error);
        return NextResponse.json({ error: "internal server error"}, {
            status: 500
        })
    }
    
}

export async function POST(request: Request){
    try{
        const body = await request.json();
        const { userId, content, sentiment } = body;

        const newConversation = await prisma.conversation.create({
            data: {
                userId,
                content,
                sentiment
            }
        })
        return NextResponse.json(newConversation, {status: 201})
    }catch(error){
        console.log('error creating conversation', error)
        return NextResponse.json({
            error: 'internal server error'
        }, {
            status: 500
        })
    }
}

export async function PUT(request: Request){
    try{
        const body = await request.json();
        const { id, content, sentiment} = body

        const updatedConversation = await prisma.conversation.update({
            where: { id },
            data: {
                content, sentiment
            }
        })
        return NextResponse.json(updatedConversation, {
            status: 200
        })
    }catch(error){
        console.log('internal server error', error);
        return NextResponse.json({
            error: "internal server error"
        },{
            status: 500
        })
    }
}

export async function DELETE(request: Request){
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id');

    if(!id){
        return NextResponse.json({
            error: "conversation id is required"
        }, {
            status: 400
        })
    }
    try{
        await prisma.conversation.delete({
            where: {
                id
            },
        })
        return NextResponse.json({ message: 'Conversation deleted successfully' });
    }catch(error){
        console.error('error deleting conversation', error);
        return NextResponse.json({
            error: "internal server error"
        }, {
            status: 500
        })
    }
}