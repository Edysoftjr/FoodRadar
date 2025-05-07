import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FoodRadar</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/search">
              <Button variant="ghost" size="sm">
                Search
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                Profile
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="gradient-bg py-12 md:py-24 lg:py-32">
          <div className="container">
            <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
              <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
                Discover Food Near You
              </h1>
              <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
                Find restaurants and meals within your budget, just a few taps away.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="rounded-full px-8">
                    Get Started
                  </Button>
                </Link>
                <Link href="/search">
                  <Button variant="outline" size="lg" className="rounded-full px-8">
                    Explore Nearby
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="container py-8 md:py-12 lg:py-16">
          <h2 className="mb-8 text-2xl font-bold">Popular Near You</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <RestaurantCard key={i} />
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FoodRadar. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function RestaurantCard() {
  return (
    <div className="food-card group">
      <div className="aspect-video overflow-hidden bg-muted">
        <img
          src="/placeholder.svg?height=225&width=400"
          alt="Restaurant"
          className="food-card-image"
          width={400}
          height={225}
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Restaurant Name</h3>
          <span className="text-xs text-muted-foreground">2.3 km</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Avg: ₦2,500</span>
          <span className="text-sm">★★★★☆</span>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="relative h-12 w-12 overflow-hidden rounded-md">
            <img
              src="/placeholder.svg?height=48&width=48"
              alt="Meal"
              className="h-full w-full object-cover"
              width={48}
              height={48}
            />
            <div className="absolute bottom-0 w-full bg-primary/80 px-1 py-0.5 text-center text-[10px] text-white">
              ₦1,800
            </div>
          </div>
          <div className="relative h-12 w-12 overflow-hidden rounded-md">
            <img
              src="/placeholder.svg?height=48&width=48"
              alt="Meal"
              className="h-full w-full object-cover"
              width={48}
              height={48}
            />
            <div className="absolute bottom-0 w-full bg-primary/80 px-1 py-0.5 text-center text-[10px] text-white">
              ₦2,200
            </div>
          </div>
        </div>
        <Button className="mt-3 w-full rounded-full" size="sm">
          View Restaurant
        </Button>
      </div>
    </div>
  )
}
