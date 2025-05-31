"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { MapPin, SearchIcon, ArrowLeft, Filter, X, Map, List, Heart } from "lucide-react"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([3000])
  const [viewMode, setViewMode] = useState<"list" | "map">("list")

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/home" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
              className="rounded-full"
            >
              {viewMode === "list" ? <Map className="h-5 w-5" /> : <List className="h-5 w-5" />}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Filter className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Results</SheetTitle>
                  <SheetDescription>Customize your search results</SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">Categories</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {["Local", "Continental", "Fast Food", "Seafood", "Vegetarian", "Desserts"].map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox id={`category-${category}`} />
                          <Label htmlFor={`category-${category}`}>{category}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-medium">Price Range</h3>
                      <span>Up to ₦{priceRange[0].toLocaleString()}</span>
                    </div>
                    <Slider
                      value={priceRange}
                      min={500}
                      max={10000}
                      step={100}
                      onValueChange={setPriceRange}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>₦500</span>
                      <span>₦5,000</span>
                      <span>₦10,000</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Distance</h3>
                    <Select defaultValue="10">
                      <SelectTrigger className="rounded-full">
                        <SelectValue placeholder="Select distance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">Within 2km</SelectItem>
                        <SelectItem value="5">Within 5km</SelectItem>
                        <SelectItem value="10">Within 10km</SelectItem>
                        <SelectItem value="15">Within 15km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Available Now</h3>
                      <Switch />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Only show restaurants and meals that are currently available
                    </p>
                  </div>
                </div>

                <SheetFooter className="mt-6 flex-row justify-between">
                  <Button variant="outline" className="rounded-full">
                    <X className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  <SheetClose asChild>
                    <Button className="rounded-full">Apply Filters</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search restaurants, meals, or cuisines..."
                className="pl-9 pr-9 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Searching near: Lagos, Nigeria</span>
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-6 rounded-full">
              <TabsTrigger value="all" className="rounded-full">
                All
              </TabsTrigger>
              <TabsTrigger value="restaurants" className="rounded-full">
                Restaurants
              </TabsTrigger>
              <TabsTrigger value="meals" className="rounded-full">
                Meals
              </TabsTrigger>
            </TabsList>

            {viewMode === "list" ? (
              <>
                <TabsContent value="all" className="mt-0">
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold">Restaurants</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <RestaurantSearchCard key={i} index={i} />
                      ))}
                    </div>

                    <h2 className="text-lg font-semibold">Meals</h2>
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <MealSearchCard key={i} index={i} />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="restaurants" className="mt-0">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <RestaurantSearchCard key={i} index={i} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="meals" className="mt-0">
                  <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <MealSearchCard key={i} index={i} />
                    ))}
                  </div>
                </TabsContent>
              </>
            ) : (
              <div className="overflow-hidden rounded-xl border shadow-sm">
                <div className="aspect-[4/3] bg-muted">
                  <img
                    src="/placeholder.svg?height=600&width=800&text=HERE+Maps+Integration"
                    alt="Search Results Map"
                    className="h-full w-full object-cover"
                    width={800}
                    height={600}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium">Map View</h3>
                  <p className="text-sm text-muted-foreground">Showing 15 results near your location</p>
                </div>
              </div>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  )
}

function RestaurantSearchCard({ index }: { index: number }) {
  return (
    <div className="food-card">
      <div className="aspect-video bg-muted">
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
          <h3 className="font-semibold">Restaurant Name {index + 1}</h3>
          <span className="text-xs text-muted-foreground">{1.5 + index * 0.7} km</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Avg: ₦{(2000 + index * 300).toLocaleString()}</span>
          <span className="text-sm">★★★★☆</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <Badge variant="secondary" className="rounded-full text-xs">
            {index % 2 === 0 ? "Local" : "Continental"}
          </Badge>
          <Badge variant="secondary" className="rounded-full text-xs">
            {index % 3 === 0 ? "Fast Food" : "Seafood"}
          </Badge>
        </div>
        <Link href={`/restaurant/${index + 1}`}>
          <Button className="mt-3 w-full rounded-full" size="sm">
            View Restaurant
          </Button>
        </Link>
      </div>
    </div>
  )
}

function MealSearchCard({ index }: { index: number }) {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="food-card">
      <div className="relative aspect-square bg-muted">
        <img
          src="/placeholder.svg?height=200&width=200"
          alt="Meal"
          className="h-full w-full object-cover"
          width={200}
          height={200}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-primary text-primary" : ""}`} />
        </Button>
      </div>
      <div className="p-4">
        <h3 className="font-medium">Meal Name {index + 1}</h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-semibold">₦{(1500 + index * 300).toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">{1.5 + index * 0.5} km</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Restaurant Name {Math.floor(index / 2) + 1}</p>
        <Link href={`/restaurant/${Math.floor(index / 2) + 1}`}>
          <Button className="mt-3 w-full rounded-full" size="sm">
            View Restaurant
          </Button>
        </Link>
      </div>
    </div>
  )
}
