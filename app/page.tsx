"use client"

import Image from 'next/image';
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, ArrowRight, Utensils, MapPinned, Clock } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/home")
    }
  }, [user, router])

  return (
    <div className="flex min-h-screen flex-col">
   
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
             <Image
              alt="FoodRadar App"
              src="/foodrlogo.png"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
              />
              <span className="text-xl font-bold">FoodRadar</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-full">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Find Food Within Your Budget
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Discover restaurants and meals that fit your budget and preferences. FoodRadar helps you find the
                  perfect dining options nearby.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link href="/signup">
                    <Button size="lg" className="rounded-full w-full sm:w-auto">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/home">
                    <Button variant="outline" size="lg" className="rounded-full w-full sm:w-auto">
                      Explore Restaurants
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-xl">
                <img
                  alt="FoodRadar App"
                  className="object-cover w-full h-full"
                  src="https://ixfnkgxjzjkmucxlxurx.supabase.co/storage/v1/object/sign/foodradar-storage/custom/foodr1.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzEwZDI3NzU5LTM0NDktNGVkOS05NDNmLTg4ZTA3MWM0YTNiMSJ9.eyJ1cmwiOiJmb29kcmFkYXItc3RvcmFnZS9jdXN0b20vZm9vZHIxLnBuZyIsImlhdCI6MTc0NzkyMTgzNCwiZXhwIjo4ODE0ODYxMzAzNH0.3UbpBwi6HwvicjLHMzUevNabcZgXvJOqwRms2dvVwUo"
                  width={550}
                  height={310}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-muted py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tighter">How It Works</h2>
              <p className="text-muted-foreground mt-2 md:text-lg">Find your next meal in three simple steps</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <MapPinned className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Share Your Location</h3>
                <p className="text-muted-foreground">
                  Allow FoodRadar to access your location to find restaurants near you
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Utensils className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Set Your Budget</h3>
                <p className="text-muted-foreground">Tell us your budget range to find meals that fit your wallet</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Discover & Order</h3>
                <p className="text-muted-foreground">Browse restaurants, view menus, and place your order</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tighter">Ready to find your next meal?</h2>
              <p className="text-muted-foreground mt-2 md:text-lg mb-8">
                Join thousands of users finding great food within their budget
              </p>
              <Link href="/signup">
                <Button size="lg" className="rounded-full">
                  Sign Up Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 text-center">
          <div className="flex items-center">
            <Image
              alt="FoodRadar App"
              src="/foodrlogo.png"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
              />
            <span className="text-lg font-bold">FoodRadar</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} FoodRadar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
