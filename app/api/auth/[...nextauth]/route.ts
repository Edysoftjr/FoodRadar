import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { compare } from "bcryptjs"

const prisma = new PrismaClient()

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: profile.role || "USER",
        }
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Allow OAuth providers to link with existing accounts
      if (account?.provider === "google" && profile?.email) {
        // Check if user exists with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
          include: { accounts: true },
        })

        // If user exists but doesn't have a Google account linked
        if (existingUser) {
          // Check if this Google account is already linked to another user
          const existingGoogleAccount = await prisma.account.findFirst({
            where: {
              provider: "google",
              providerAccountId: profile.sub,
            },
          })

          // If this Google account is not linked to any user yet
          if (!existingGoogleAccount) {
            // Link this Google account to the existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            })

            // Update user profile with Google info if needed
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: existingUser.name || profile.name,
                image: existingUser.image || profile.picture,
              },
            })

            return true
          }
        }
      }

      // Default allow sign in
      return true
    },
    async jwt({ token, user, account }) {
      // Add user ID and role to the token when it's created
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      // Add the provider to the token
      if (account) {
        token.provider = account.provider
      }

      return token
    },
    async session({ session, token }) {
      // Add user ID and role to the session
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string

        // Ensure we have the latest user data
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
        })

        if (user) {
          session.user.name = user.name
          session.user.image = user.image
          session.user.role = user.role
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/signup",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
