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
       }
       
    } catch(error){
        console.log('error fetching conversation', error);
        return NextResponse.json({ error: "internal server error"}, {
            status: 500
        })
    }
    
}