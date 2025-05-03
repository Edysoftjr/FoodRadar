"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Upload, Edit, Trash2, Plus, Heart, Clock } from "lucide-react"

export default function ProfilePage() {
  const [userType, setUserType] = useState("user") // "user" or "vendor"
  const [activeTab, setActiveTab] = useState("profile")

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
            <span className="text-lg font-semibold">My Profile</span>
          </div>

          <div className="w-20"></div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-6">
          <Tabs defaultValue={userType} onValueChange={setUserType} className="mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="user">User Profile</TabsTrigger>
              <TabsTrigger value="vendor">Restaurant Owner</TabsTrigger>
            </TabsList>
          </Tabs>

          {userType === "user" && (
            <div className="grid gap-6 md:grid-cols-[240px_1fr]">
              <Card>
                <CardContent className="p-4">
                  <Tabs defaultValue={activeTab} orientation="vertical" onValueChange={setActiveTab}>
                    <TabsList className="flex flex-col items-start justify-start">
                      <TabsTrigger value="profile" className="w-full justify-start">
                        Profile
                      </TabsTrigger>
                      <TabsTrigger value="saved" className="w-full justify-start">
                        Saved Items
                      </TabsTrigger>
                      <TabsTrigger value="history" className="w-full justify-start">
                        Search History
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>

              <div>
                {activeTab === "profile" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your profile information and preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
                        <div className="relative">
                          <div className="h-24 w-24 overflow-hidden rounded-full bg-muted">
                            <img
                              src="/placeholder.svg?height=96&width=96"
                              alt="Profile"
                              className="h-full w-full object-cover"
                              width={96}
                              height={96}
                            />
                          </div>
                          <Button
                            size="icon"
                            variant="outline"
                            className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="w-full space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input id="name" defaultValue="John Doe" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" type="email" defaultValue="john@example.com" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" defaultValue="Lagos, Nigeria" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Budget Range (₦)</Label>
                          <span>₦2,500</span>
                        </div>
                        <Slider defaultValue={[2500]} max={10000} step={500} className="py-4" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>₦1,000</span>
                          <span>₦5,000</span>
                          <span>₦10,000</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Food Preferences</Label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {["Spicy", "Vegetarian", "Local", "Continental", "Fast Food", "Seafood"].map((pref) => (
                            <div key={pref} className="flex items-center space-x-2">
                              <Checkbox id={`pref-${pref}`} defaultChecked={["Spicy", "Local"].includes(pref)} />
                              <Label htmlFor={`pref-${pref}`}>{pref}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Save Changes</Button>
                    </CardFooter>
                  </Card>
                )}

                {activeTab === "saved" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Saved Restaurants & Meals</CardTitle>
                      <CardDescription>Restaurants and meals you've saved for later</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="restaurants">
                        <TabsList className="mb-4">
                          <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
                          <TabsTrigger value="meals">Meals</TabsTrigger>
                        </TabsList>

                        <TabsContent value="restaurants" className="mt-0">
                          <div className="grid gap-4 sm:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <div key={i} className="flex overflow-hidden rounded-lg border">
                                <div className="h-24 w-24 flex-shrink-0 bg-muted">
                                  <img
                                    src="/placeholder.svg?height=96&width=96"
                                    alt="Restaurant"
                                    className="h-full w-full object-cover"
                                    width={96}
                                    height={96}
                                  />
                                </div>
                                <div className="flex flex-1 flex-col justify-between p-3">
                                  <div>
                                    <h3 className="font-medium">Restaurant Name</h3>
                                    <p className="text-xs text-muted-foreground">2.3 km • Avg: ₦2,500</p>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Link href="/restaurant/1">
                                      <Button size="sm" variant="outline">
                                        View
                                      </Button>
                                    </Link>
                                    <Button size="icon" variant="ghost">
                                      <Heart className="h-4 w-4 text-primary" fill="currentColor" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="meals" className="mt-0">
                          <div className="grid gap-4 sm:grid-cols-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div key={i} className="flex overflow-hidden rounded-lg border">
                                <div className="h-24 w-24 flex-shrink-0 bg-muted">
                                  <img
                                    src="/placeholder.svg?height=96&width=96"
                                    alt="Meal"
                                    className="h-full w-full object-cover"
                                    width={96}
                                    height={96}
                                  />
                                </div>
                                <div className="flex flex-1 flex-col justify-between p-3">
                                  <div>
                                    <h3 className="font-medium">Meal Name</h3>
                                    <p className="text-xs text-muted-foreground">₦2,500 • Restaurant Name</p>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Link href="/restaurant/1">
                                      <Button size="sm" variant="outline">
                                        View
                                      </Button>
                                    </Link>
                                    <Button size="icon" variant="ghost">
                                      <Heart className="h-4 w-4 text-primary" fill="currentColor" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "history" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Search History</CardTitle>
                      <CardDescription>Your recent searches and viewed restaurants</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{i % 2 === 0 ? "Restaurant Name" : "Search: Nigerian Food"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {i < 3 ? "Today" : i < 5 ? "Yesterday" : "3 days ago"}
                              </span>
                              <Button size="icon" variant="ghost">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline">Clear All History</Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            </div>
          )}

          {userType === "vendor" && (
            <div className="grid gap-6 md:grid-cols-[240px_1fr]">
              <Card>
                <CardContent className="p-4">
                  <Tabs defaultValue={activeTab} orientation="vertical" onValueChange={setActiveTab}>
                    <TabsList className="flex flex-col items-start justify-start">
                      <TabsTrigger value="profile" className="w-full justify-start">
                        Business Profile
                      </TabsTrigger>
                      <TabsTrigger value="meals" className="w-full justify-start">
                        Manage Meals
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>

              <div>
                {activeTab === "profile" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Restaurant Information</CardTitle>
                      <CardDescription>Update your restaurant profile and details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <Label>Restaurant Cover Image</Label>
                        <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                          <img
                            src="/placeholder.svg?height=225&width=400"
                            alt="Restaurant Cover"
                            className="h-full w-full object-cover"
                            width={400}
                            height={225}
                          />
                          <Button size="sm" className="absolute bottom-2 right-2">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="restaurantName">Restaurant Name</Label>
                          <Input id="restaurantName" defaultValue="Tasty Delights" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ownerName">Owner Name</Label>
                          <Input id="ownerName" defaultValue="John Doe" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="restaurant@example.com" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" defaultValue="Lagos, Nigeria" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Restaurant Description</Label>
                        <Textarea
                          id="description"
                          rows={4}
                          defaultValue="We serve the best local and continental dishes in town. Our chefs are experienced and use only the freshest ingredients."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Cuisine Types</Label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {["Local", "Continental", "Fast Food", "Seafood", "Vegetarian", "Desserts"].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox id={`type-${type}`} defaultChecked={["Local", "Continental"].includes(type)} />
                              <Label htmlFor={`type-${type}`}>{type}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Save Changes</Button>
                    </CardFooter>
                  </Card>
                )}

                {activeTab === "meals" && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Manage Meals</CardTitle>
                        <CardDescription>Add, edit or remove meals from your restaurant</CardDescription>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Meal
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Meal</DialogTitle>
                            <DialogDescription>
                              Fill in the details to add a new meal to your restaurant
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="mealName">Meal Name</Label>
                              <Input id="mealName" placeholder="Enter meal name" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="mealPrice">Price (₦)</Label>
                              <Input id="mealPrice" type="number" placeholder="Enter price" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="mealCategory">Category</Label>
                              <Select>
                                <SelectTrigger id="mealCategory">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="local">Local</SelectItem>
                                  <SelectItem value="continental">Continental</SelectItem>
                                  <SelectItem value="fastfood">Fast Food</SelectItem>
                                  <SelectItem value="seafood">Seafood</SelectItem>
                                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                                  <SelectItem value="dessert">Dessert</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="mealDescription">Description</Label>
                              <Textarea id="mealDescription" placeholder="Describe the meal" />
                            </div>
                            <div className="space-y-2">
                              <Label>Meal Image</Label>
                              <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                                <Button variant="outline" type="button">
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Image
                                </Button>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Add Meal</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Image</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Available</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <TableRow key={i}>
                                <TableCell>
                                  <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                                    <img
                                      src="/placeholder.svg?height=40&width=40"
                                      alt="Meal"
                                      className="h-full w-full object-cover"
                                      width={40}
                                      height={40}
                                    />
                                  </div>
                                </TableCell>
                                <TableCell>Meal Name {i + 1}</TableCell>
                                <TableCell>₦{(1500 + i * 500).toLocaleString()}</TableCell>
                                <TableCell>
                                  {i % 2 === 0 ? "Local" : i % 3 === 0 ? "Continental" : "Fast Food"}
                                </TableCell>
                                <TableCell>
                                  <Switch defaultChecked={i !== 2} />
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button size="icon" variant="ghost">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
