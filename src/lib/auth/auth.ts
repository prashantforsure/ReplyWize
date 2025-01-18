import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client/extension";
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";


const prisma = new PrismaClient();
export const authoptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
   callbacks: {
    async signIn({user, account}){
        if(account?.provider == 'google'){
            const existingUser = await prisma.user.findUnique({
                where: {
                    email : user.email
                },
            });
            if(!existingUser){
           await  prisma.user.create({
            data: {
                email: user.email!,
                name: user.name ?? null,
                image: user.image ?? null,
                password: "",
                preferences: {
                    create: {
                      theme: "light",
                      emailNotifications: true,
                    },
                  },
            }
           })
            }
        }
        return true;
    },
    async jwt({ token, user }){
        if(user) {
            token.id = user.id;
        }
        return token;
    },
    async session({ session, token }){
        if(token && session.user){
            session.user.id = token.id as string;
        }
        return session;
    },
    redirect({ baseUrl }) {

        return `${baseUrl}/dashboard`;
    },
   },
   pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET!,
}