import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { OAuth2Client } from "google-auth-library"

// Types
export type User = {
  id: string
  name: string
  email: string
  image?: string | null
  role: "user" | "vendor" | "admin"
}

export type AuthError = {
  message: string
}

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const COOKIE_NAME = "foodradar_auth_token"
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ""
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ""
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback"

// Helper functions
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// JWT functions
export async function createToken(user: User): Promise<string> {
  const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(JWT_SECRET))

  return token
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    const userId = verified.payload.id as string

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    })

    return user
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

// Session management
export async function setAuthCookie(token: string): Promise<void> {
  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
}

export async function removeAuthCookie(): Promise<void> {
  cookies().delete(COOKIE_NAME)
}

export async function getAuthToken(): Promise<string | undefined> {
  return cookies().get(COOKIE_NAME)?.value
}

// Auth functions
export async function getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const token = await getAuthToken()

    if (!token) {
      return { user: null, error: null }
    }

    const user = await verifyToken(token)
    return { user, error: null }
  } catch (error) {
    console.error("Get current user error:", error)
    return {
      user: null,
      error: { message: "Failed to get current user" },
    }
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  role: "user" | "vendor",
): Promise<{ data: { user: User } | null; error: AuthError | null }> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        data: null,
        error: { message: "User with this email already exists" },
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        name,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    })

    // Create profile based on role
    if (role === "user") {
      await prisma.userProfile.create({
        data: {
          userId: newUser.id,
          budget: 2500, // Default budget
        },
      })
    } else if (role === "vendor") {
      await prisma.vendorProfile.create({
        data: {
          userId: newUser.id,
        },
      })
    }

    // Create and set token
    const token = await createToken(newUser)
    await setAuthCookie(token)

    return { data: { user: newUser }, error: null }
  } catch (error) {
    console.error("Sign up error:", error)
    return {
      data: null,
      error: { message: "Failed to create account" },
    }
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ data: { user: User } | null; error: AuthError | null }> {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        image: true,
        role: true,
      },
    })

    if (!user || !user.password) {
      return {
        data: null,
        error: { message: "Invalid email or password" },
      }
    }

    // Verify password
    const passwordValid = await comparePasswords(password, user.password)
    if (!passwordValid) {
      return {
        data: null,
        error: { message: "Invalid email or password" },
      }
    }

    // Create and set token
    const { password: _, ...userWithoutPassword } = user
    const token = await createToken(userWithoutPassword)
    await setAuthCookie(token)

    return { data: { user: userWithoutPassword }, error: null }
  } catch (error) {
    console.error("Sign in error:", error)
    return {
      data: null,
      error: { message: "Failed to sign in" },
    }
  }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    await removeAuthCookie()
    return { error: null }
  } catch (error) {
    console.error("Sign out error:", error)
    return { error: { message: "Failed to sign out" } }
  }
}

// Google OAuth functions
export function getGoogleAuthUrl(): string {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth"
  const options = {
    redirect_uri: GOOGLE_REDIRECT_URI,
    client_id: GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"].join(
      " ",
    ),
  }

  const queryString = new URLSearchParams(options)
  return `${rootUrl}?${queryString.toString()}`
}

export async function getGoogleOAuthTokens(code: string): Promise<any> {
  const url = "https://oauth2.googleapis.com/token"
  const values = {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(values),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error getting Google OAuth tokens:", error)
    throw new Error("Failed to get Google OAuth tokens")
  }
}

export async function getGoogleUser(id_token: string, access_token: string): Promise<any> {
  try {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID)
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    return {
      id: payload?.sub,
      email: payload?.email,
      name: payload?.name,
      picture: payload?.picture,
    }
  } catch (error) {
    console.error("Error getting Google user:", error)
    throw new Error("Failed to get Google user")
  }
}

export async function findOrCreateGoogleUser(
  googleUser: any,
): Promise<{ data: { user: User } | null; error: AuthError | null }> {
  try {
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    })

    // If user doesn't exist, create one
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: uuidv4(),
          email: googleUser.email,
          name: googleUser.name,
          image: googleUser.picture,
          role: "user", // Default role for Google sign-ins
          googleId: googleUser.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      })

      // Create user profile
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          budget: 2500, // Default budget
        },
      })
    } else {
      // Update Google ID if not set
      if (!user.googleId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.id },
        })
      }
    }

    // Create and set token
    const token = await createToken(user)
    await setAuthCookie(token)

    return { data: { user }, error: null }
  } catch (error) {
    console.error("Find or create Google user error:", error)
    return {
      data: null,
      error: { message: "Failed to authenticate with Google" },
    }
  }
}

// Auth protection for server components
export async function requireAuth() {
  const { user } = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}
