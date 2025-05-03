"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  MapPin,
  LayoutDashboard,
  Menu,
  Utensils,
  BarChart3,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Search,
  MapPinned,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useLocation } from "@/components/location-provider"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// Mock data for charts
const viewsData = [
  { name: "Mon", views: 120 },
  { name: "Tue", views: 150 },
  { name: "Wed", views: 180 },
  { name: "Thu", views: 140 },
  { name: "Fri", views: 200 },
  { name: "Sat", views: 250 },
  { name: "Sun", views: 220 },
]

const categoryData = [
  { name: "Local", value: 45 },
  { name: "Continental", value: 25 },
  { name: "Fast Food", value: 20 },
  { name: "Desserts", value: 10 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export default function AdminDashboard() {
  const { user, signOut } = useAuth()
  const { location, updateLocation } = useLocation()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [categories, setCategories] = useState<string[]>([
    "Local",
    "Continental",
    "Fast Food",
    "Seafood",
    "Vegetarian",
    "Desserts",
  ])

  useEffect(() => {
    // Check if user is a vendor
    if (user && user.role !== "vendor") {
      toast({
        title: "Access denied",
        description: "Only restaurant owners can access the admin dashboard",
        variant: "destructive",
      })
      // Redirect to home page
      window.location.href = "/home"
    }
  }, [user, toast])

  const handleAddCategory = () => {
    if (!newCategory.trim()) return

    if (categories.includes(newCategory.trim())) {
      toast({
        title: "Category already exists",
        description: "Please enter a unique category name",
        variant: "destructive",
      })
      return
    }

    setCategories([...categories, newCategory.trim()])
    setNewCategory("")
    setShowCategoryDialog(false)

    toast({
      title: "Category added",
      description: `${newCategory.trim()} has been added to your categories`,
    })
  }

  const handleUpdateLocation = async () => {
    try {
      await updateLocation()

      // In a real app, this would update the restaurant's location in the database
      toast({
        title: "Location updated",
        description: "Your restaurant's location has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating location:", error)
      toast({
        title: "Error updating location",
        description: "Please check your location settings and try again",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} border-r md:relative md:translate-x-0`}
      >
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FoodRadarNG</span>
          </Link>
        </div>

        <div className="py-4">
          <nav className="space-y-1 px-2">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              className="w-full justify-start rounded-full"
              onClick={() => setActiveTab("overview")}
            >
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Overview
            </Button>

            <Button
              variant={activeTab === "menu" ? "default" : "ghost"}
              className="w-full justify-start rounded-full"
              onClick={() => setActiveTab("menu")}
            >
              <Utensils className="mr-2 h-5 w-5" />
              Menu Manager
            </Button>

            <Button
              variant={activeTab === "insights" ? "default" : "ghost"}
              className="w-full justify-start rounded-full"
              onClick={() => setActiveTab("insights")}
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Insights
            </Button>
          </nav>
        </div>

        <div className="absolute bottom-0 w-full border-t p-4">
          <Button variant="outline" className="w-full justify-start rounded-full" onClick={signOut}>
            <LogOut className="mr-2 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background/95 backdrop-blur">
          <div className="flex w-full items-center justify-between px-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-6 w-6" />
            </Button>

            <div className="ml-auto flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search..." className="w-[200px] rounded-full pl-8 md:w-[300px]" />
              </div>

              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted">
                  <img
                    src={user.image || "/placeholder.svg?height=32&width=32"}
                    alt="Avatar"
                    className="rounded-full"
                    width={32}
                    height={32}
                  />
                </div>
                <span className="hidden text-sm font-medium md:inline-block">{user.name}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Dashboard Overview</h1>

                <Button className="rounded-full" onClick={handleUpdateLocation}>
                  <MapPinned className="mr-2 h-4 w-4" />
                  Update Restaurant Location
                </Button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm text-muted-foreground">Total Meals</span>
                      <span className="text-3xl font-bold">24</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm text-muted-foreground">Total Views</span>
                      <span className="text-3xl font-bold">1,245</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm text-muted-foreground">Favorites</span>
                      <span className="text-3xl font-bold">86</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm text-muted-foreground">Trending Dishes</span>
                      <span className="text-3xl font-bold">5</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Views</CardTitle>
                  <CardDescription>Number of views over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={viewsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="views" fill="#f97316" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Meals</CardTitle>
                    <CardDescription>Your most viewed meals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                            <img
                              src="/placeholder.svg?height=40&width=40"
                              alt="Meal"
                              className="h-full w-full object-cover"
                              width={40}
                              height={40}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">Meal Name {i + 1}</h3>
                            <p className="text-sm text-muted-foreground">
                              ₦{(1500 + i * 500).toLocaleString()} • {240 - i * 30} views
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Meal Categories</CardTitle>
                    <CardDescription>Distribution of meals by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "menu" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Menu Manager</h1>
                <div className="flex gap-2">
                  <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Food Category</DialogTitle>
                        <DialogDescription>Create a new food category to organize your menu items.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="categoryName">Category Name</Label>
                          <Input
                            id="categoryName"
                            placeholder="e.g., Desserts, Breakfast, etc."
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="rounded-full"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="submit"
                          onClick={handleAddCategory}
                          disabled={!newCategory.trim()}
                          className="rounded-full"
                        >
                          Add Category
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button className="rounded-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Meal
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex w-full max-w-sm items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search meals..." className="rounded-full" />
                </div>

                <Select defaultValue="all">
                  <SelectTrigger className="w-full max-w-[180px] rounded-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                    {Array.from({ length: 10 }).map((_, i) => (
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
                        <TableCell>{i % 2 === 0 ? "Local" : i % 3 === 0 ? "Continental" : "Fast Food"}</TableCell>
                        <TableCell>
                          <Switch defaultChecked={i !== 2 && i !== 5} />
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
            </div>
          )}

          {activeTab === "insights" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Insights</h1>

              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Performance</CardTitle>
                  <CardDescription>View statistics about your restaurant's performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={viewsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="views" fill="#f97316" name="Views" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Meals by Category</CardTitle>
                    <CardDescription>Most popular meals in each category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="local">
                      <TabsList className="mb-4 rounded-full">
                        <TabsTrigger value="local" className="rounded-full">
                          Local
                        </TabsTrigger>
                        <TabsTrigger value="continental" className="rounded-full">
                          Continental
                        </TabsTrigger>
                        <TabsTrigger value="fastfood" className="rounded-full">
                          Fast Food
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="local" className="mt-0 space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                              <img
                                src="/placeholder.svg?height=40&width=40"
                                alt="Meal"
                                className="h-full w-full object-cover"
                                width={40}
                                height={40}
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">Local Meal {i + 1}</h3>
                              <p className="text-sm text-muted-foreground">
                                ₦{(1800 + i * 300).toLocaleString()} • {180 - i * 25} views
                              </p>
                            </div>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="continental" className="mt-0 space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                              <img
                                src="/placeholder.svg?height=40&width=40"
                                alt="Meal"
                                className="h-full w-full object-cover"
                                width={40}
                                height={40}
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">Continental Meal {i + 1}</h3>
                              <p className="text-sm text-muted-foreground">
                                ₦{(2500 + i * 500).toLocaleString()} • {150 - i * 20} views
                              </p>
                            </div>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="fastfood" className="mt-0 space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                              <img
                                src="/placeholder.svg?height=40&width=40"
                                alt="Meal"
                                className="h-full w-full object-cover"
                                width={40}
                                height={40}
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">Fast Food Meal {i + 1}</h3>
                              <p className="text-sm text-muted-foreground">
                                ₦{(1200 + i * 300).toLocaleString()} • {200 - i * 30} views
                              </p>
                            </div>
                          </div>
                        ))}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                    <CardDescription>Distribution of meals by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
