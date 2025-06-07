"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Share, MoreHorizontal, MapPin, Star, ImageIcon, Smile, X } from "lucide-react" // Added X icon
import { BottomNavbar } from "@/components/bottom-navbar"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

type CommunityPost = {
  id: string
  user: {
    id: string
    name: string
    image?: string
    type: "USER" | "RESTAURANT"
  }
  restaurant?: {
    id: string
    name: string
    rating: number
  }
  content: string
  images?: string[]
  timestamp: string
  likes: number
  comments: number
  isLiked: boolean
  replies: Reply[]
}

type Reply = {
  id: string
  user: {
    id: string
    name: string
    image?: string
  }
  content: string
  timestamp: string
  likes: number
  isLiked: boolean
  parentId?: string
  replies?: Reply[]
}

export default function CommunityPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState("")
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("")
  const [replyingTo, setReplyingTo] = useState<{ postId: string; replyId?: string } | null>(null)
  const [replyContent, setReplyContent] = useState("")

  useEffect(() => {
    const fetchCommunityPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/community")
        if (!response.ok) throw new Error("Failed to fetch community posts")

        const data = await response.json()
        setPosts(data.posts || [])
      } catch (error) {
        console.error("Error fetching community posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCommunityPosts()
  }, [])

  const handleCreatePost = async () => {
    if (!newPost.trim()) return

    try {
      const response = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newPost,
          restaurantId: selectedRestaurant || undefined,
        }),
      })

      if (response.ok) {
        const newPostData = await response.json()
        setPosts([newPostData, ...posts])
        setNewPost("")
        setSelectedRestaurant("")
        toast({
          title: "Post shared!",
          description: "Your post has been shared with the community",
        })
      } else {
         // Handle specific error from backend if available
         const errorData = await response.json().catch(() => null); // Try to parse error
         toast({
            title: "Error",
            description: errorData?.message || "Failed to share post",
            variant: "destructive",
         })
      }
    } catch (error) {
      console.error("Error creating post:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while sharing the post.",
        variant: "destructive",
      })
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/community/${postId}/like`, {
        method: "POST",
      })

      if (response.ok) {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: !post.isLiked,
                  likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                }
              : post,
          ),
        )
      } else {
         console.error("Failed to like post", await response.text())
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleReply = async (postId: string, parentReplyId?: string) => {
    if (!replyContent.trim()) return

    try {
      const response = await fetch(`/api/community/${postId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent,
          parentId: parentReplyId,
        }),
      })

      if (response.ok) {
        const newReply = await response.json()
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id === postId) {
              const addReplyRecursively = (replies: Reply[]): Reply[] => {
                return replies.map(reply => {
                  if (reply.id === parentReplyId) {
                    return { ...reply, replies: [...(reply.replies || []), newReply] };
                  }
                  if (reply.replies) {
                    return { ...reply, replies: addReplyRecursively(reply.replies) };
                  }
                  return reply;
                });
              };

              if (parentReplyId) {
                return { ...post, replies: addReplyRecursively(post.replies), comments: post.comments + 1 };
              } else {
                return { ...post, replies: [...post.replies, newReply], comments: post.comments + 1 };
              }
            }
            return post;
          }),
        )
        setReplyContent("")
        setReplyingTo(null)
      } else {
         console.error("Failed to post reply", await response.text())
      }
    } catch (error) {
      console.error("Error posting reply:", error)
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const postTime = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - postTime.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pb-16 bg-muted/40">
        <div className="text-center p-8 bg-background rounded-lg shadow-md">
          <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Join the conversation</h2>
          <p className="text-muted-foreground mb-4">Sign in to participate in restaurant discussions</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
        <BottomNavbar />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col pb-16 bg-muted/40">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur shadow-sm">
        <div className="container flex h-16 items-center px-4 mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <Image
              alt="FoodRadar App"
              src="/foodrlogo.png"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
            <span className="text-xl font-bold tracking-tight">Community</span>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6">
        <div className="container px-4 mx-auto max-w-2xl">
          {/* --- Redesigned Create Post --- */}
          <Card className="mb-6 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 flex-shrink-0 mt-1">
                  <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                  <AvatarFallback>{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder={`What's on your mind, ${user.name}? Share your experience...`}
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="w-full min-h-[80px] resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-2 text-sm placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Selected Restaurant Badge */}
              {selectedRestaurant && (
                <div className="mt-3 ml-14">
                    <Badge variant="secondary" className="py-1 px-2 rounded-full text-sm font-normal group">
                      <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      <span>{selectedRestaurant}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedRestaurant("")}
                        className="h-5 w-5 ml-1.5 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span className="sr-only">Remove restaurant tag</span>
                      </Button>
                    </Badge>
                </div>
              )}

              {/* Actions & Post Button */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 ml-14">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <ImageIcon className="h-5 w-5" />
                    <span className="sr-only">Add image</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Smile className="h-5 w-5" />
                    <span className="sr-only">Add emoji</span>
                  </Button>
                  {/* Simplified Restaurant Tagging - Using Input for now */}
                  <div className="relative group">
                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full peer">
                        <MapPin className="h-5 w-5" />
                        <span className="sr-only">Tag restaurant</span>
                     </Button>
                     {/* Show input only when restaurant not selected, could refine this interaction */}
                     {!selectedRestaurant && (
                        <Input
                           placeholder="Tag restaurant..."
                           value={selectedRestaurant} // Keep controlled
                           onChange={(e) => setSelectedRestaurant(e.target.value)}
                           className="h-8 text-xs w-32 absolute left-0 bottom-full mb-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible peer-focus:opacity-100 peer-focus:visible transition-all duration-200 ease-in-out z-10 shadow-sm"
                        />
                     )}
                  </div>
                </div>
                <Button size="sm" disabled={!newPost.trim()} onClick={handleCreatePost} className="rounded-full px-5">
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* --- End Redesigned Create Post --- */}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-background rounded-lg shadow-sm">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
              <p className="text-lg font-medium text-muted-foreground">Loading discussions...</p>
              <p className="text-sm text-muted-foreground/80">Please wait a moment.</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-5">
              {posts.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  onLike={() => handleLike(post.id)}
                  onReply={handleReply}
                  formatTimeAgo={formatTimeAgo}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  currentUserImage={user.image}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-background rounded-lg shadow-sm">
              <MessageCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-5" />
              <h3 className="text-xl font-semibold mb-2">It's quiet in here...</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Be the first to share your thoughts or experiences about local restaurants!</p>
              {/* Maybe add a subtle button to prompt creation? */}
              {/* <Button variant="outline" onClick={() => document.querySelector('textarea')?.focus()}>Start a Post</Button> */}
            </div>
          )}
        </div>
      </main>

      <BottomNavbar />
    </div>
  )
}

function CommunityPostCard({ // Added currentUserImage prop
  post,
  onLike,
  onReply,
  formatTimeAgo,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  currentUserImage,
}: {
  post: CommunityPost
  onLike: () => void
  onReply: (postId: string, parentReplyId?: string) => void
  formatTimeAgo: (timestamp: string) => string
  replyingTo: { postId: string; replyId?: string } | null
  setReplyingTo: (reply: { postId: string; replyId?: string } | null) => void
  replyContent: string
  setReplyContent: (content: string) => void
  currentUserImage?: string // Added prop type
}) {
  const [showAllReplies, setShowAllReplies] = useState(false)

  const renderReply = (reply: Reply, depth = 0): JSX.Element => (
    <div key={reply.id} className={`flex gap-2 ${depth > 0 ? "ml-8 mt-3" : "mt-4"}`}>
      <Avatar className="h-7 w-7 flex-shrink-0 mt-1">
        <AvatarImage src={reply.user.image || "/placeholder.svg"} alt={reply.user.name}/>
        <AvatarFallback className="text-xs">{reply.user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/70 rounded-lg px-3 py-2">
          <div className="flex items-baseline gap-2 mb-0.5">
            <h4 className="font-semibold text-sm leading-tight">{reply.user.name}</h4>
            <span className="text-xs text-muted-foreground flex-shrink-0">路 {formatTimeAgo(reply.timestamp)}</span>
          </div>
          <p className="text-sm leading-snug">{reply.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 pl-1">
          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">
            <Heart className="h-3.5 w-3.5 mr-1" />
            {reply.likes > 0 && reply.likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
            onClick={() =>
              setReplyingTo(
                replyingTo?.postId === post.id && replyingTo?.replyId === reply.id
                  ? null
                  : { postId: post.id, replyId: reply.id },
              )
            }
          >
            Reply
          </Button>
        </div>

        {/* Nested reply input */} 
        {replyingTo?.postId === post.id && replyingTo?.replyId === reply.id && (
          <div className="mt-2 flex gap-2 items-center">
            <Avatar className="h-6 w-6">
              <AvatarImage src={currentUserImage || ""} />
              <AvatarFallback className="text-xs">U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Input
                placeholder={`Reply to ${reply.user.name}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="h-8 text-sm rounded-full px-3 bg-muted/70 border-transparent focus:border-primary focus:bg-background"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && replyContent.trim()) {
                    e.preventDefault(); // Prevent newline on Enter
                    onReply(post.id, reply.id)
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Nested replies */} 
        {reply.replies && reply.replies.length > 0 && (
          <div className="mt-2">
            {reply.replies.map((nestedReply) => renderReply(nestedReply, depth + 1))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Card className="shadow-sm overflow-hidden bg-background">
      <CardContent className="p-4">
        {/* Header */} 
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user.image || "/placeholder.svg"} alt={post.user.name}/>
              <AvatarFallback>{post.user.type === "RESTAURANT" ? "R" : post.user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm leading-tight">{post.user.name}</h3>
                {post.user.type === "RESTAURANT" && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-primary/50 text-primary bg-primary/10">
                    Restaurant
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-tight">{formatTimeAgo(post.timestamp)}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-muted-foreground rounded-full">
                <MoreHorizontal className="h-4.5 w-4.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Report Post</DropdownMenuItem>
              <DropdownMenuItem>Hide Post</DropdownMenuItem>
              {/* Add more options like Edit/Delete if applicable */} 
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Restaurant mention */} 
        {post.restaurant && (
          <div className="mb-3 pl-13 -mt-1">
            <Link href={`/restaurants/${post.restaurant.id}`} className="inline-block">
              <Badge variant="secondary" className="py-1 px-2.5 rounded-full text-sm font-normal hover:bg-muted transition-colors">
                <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <span className="font-medium mr-2">{post.restaurant.name}</span>
                <div className="flex items-center gap-0.5 border-l pl-2 ml-1 border-border/50">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" />
                  <span className="text-xs font-medium text-muted-foreground">{post.restaurant.rating.toFixed(1)}</span>
                </div>
              </Badge>
            </Link>
          </div>
        )}

        {/* Content */} 
        <div className="mb-3 pl-13">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Images */} 
        {post.images && post.images.length > 0 && (
          <div className="mb-3 pl-13">
            <div className={`grid gap-1.5 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {post.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative aspect-video overflow-hidden rounded-lg border">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Post image ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Add overlay for >4 images */} 
                  {index === 3 && post.images.length > 4 && (
                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">+{post.images.length - 4}</span>
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */} 
        <div className="flex items-center justify-between pt-2 mt-3 border-t border-border/50 pl-13">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 h-8 px-2 rounded-full ${post.isLiked ? "text-red-500 hover:bg-red-500/10" : "text-muted-foreground hover:text-foreground"}`}
              onClick={onLike}
            >
              <Heart className={`h-4.5 w-4.5 ${post.isLiked ? "fill-current" : ""}`} />
              <span className="text-sm font-medium tabular-nums">{post.likes > 0 ? post.likes : "Like"}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8 px-2 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() =>
                setReplyingTo(replyingTo?.postId === post.id && !replyingTo?.replyId ? null : { postId: post.id })
              }
            >
              <MessageCircle className="h-4.5 w-4.5" />
              <span className="text-sm font-medium tabular-nums">{post.comments > 0 ? post.comments : "Comment"}</span>
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
            <Share className="h-4.5 w-4.5" />
            <span className="sr-only">Share</span>
          </Button>
        </div>

        {/* Main Reply Input */} 
        {replyingTo?.postId === post.id && !replyingTo?.replyId && (
          <div className="mt-3 pt-3 border-t border-border/50 pl-13">
            <div className="flex gap-3 items-center">
              <Avatar className="h-8 w-8">
                 <AvatarImage src={currentUserImage || ""} />
                 <AvatarFallback className="text-xs">U</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  placeholder="Write a comment..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="h-9 text-sm rounded-full px-4 bg-muted/70 border-transparent focus:border-primary focus:bg-background"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && replyContent.trim()) {
                       e.preventDefault(); // Prevent newline on Enter
                       onReply(post.id)
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>
          </div>
        )}

        {/* Replies */} 
        {post.replies.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50 pl-13">
            {post.replies.slice(0, showAllReplies ? undefined : 1).map((reply) => renderReply(reply))}
            {post.replies.length > 1 && (
              <Button
                variant="link"
                size="sm"
                className="mt-2 h-auto p-0 text-sm font-medium text-primary"
                onClick={() => setShowAllReplies(!showAllReplies)}
              >
                {showAllReplies ? "Hide replies" : `View ${post.replies.length - 1} more ${post.replies.length - 1 === 1 ? 'reply' : 'replies'}`}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
