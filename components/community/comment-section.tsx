"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Heart, MessageSquare, MoreHorizontal, ThumbsUp } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

type Comment = {
  id: string
  userId: string
  userName: string
  userImage?: string
  content: string
  likes: number
  userLiked: boolean
  createdAt: Date
  replies: Reply[]
}

type Reply = {
  id: string
  userId: string
  userName: string
  userImage?: string
  content: string
  likes: number
  userLiked: boolean
  createdAt: Date
}

type CommentSectionProps = {
  type: "restaurant" | "meal"
  id: string
}

export function CommentSection({ type, id }: CommentSectionProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "comment-1",
      userId: "user-123",
      userName: "John Doe",
      userImage: "/placeholder.svg?height=40&width=40",
      content: "This place has the best jollof rice I've ever tasted! The spices are perfectly balanced.",
      likes: 12,
      userLiked: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      replies: [
        {
          id: "reply-1",
          userId: "user-456",
          userName: "Jane Smith",
          userImage: "/placeholder.svg?height=40&width=40",
          content: "I agree! Their jollof rice is amazing. Have you tried their plantain as well?",
          likes: 3,
          userLiked: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        },
      ],
    },
    {
      id: "comment-2",
      userId: "user-789",
      userName: "Michael Johnson",
      userImage: "/placeholder.svg?height=40&width=40",
      content: "The service was excellent and the food came out quickly. Will definitely be coming back!",
      likes: 5,
      userLiked: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      replies: [],
    },
  ])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const handleSubmitComment = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to post comments",
        variant: "destructive",
      })
      return
    }

    if (!comment.trim()) return

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userImage: user.image,
      content: comment,
      likes: 0,
      userLiked: false,
      createdAt: new Date(),
      replies: [],
    }

    setComments([newComment, ...comments])
    setComment("")

    toast({
      title: "Comment posted",
      description: "Your comment has been posted successfully",
    })
  }

  const handleSubmitReply = (commentId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to post replies",
        variant: "destructive",
      })
      return
    }

    if (!replyContent.trim()) return

    const newReply: Reply = {
      id: `reply-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userImage: user.image,
      content: replyContent,
      likes: 0,
      userLiked: false,
      createdAt: new Date(),
    }

    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...comment.replies, newReply],
        }
      }
      return comment
    })

    setComments(updatedComments)
    setReplyContent("")
    setReplyingTo(null)

    toast({
      title: "Reply posted",
      description: "Your reply has been posted successfully",
    })
  }

  const toggleLike = (id: string, isReply: boolean, commentId?: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like comments",
        variant: "destructive",
      })
      return
    }

    if (isReply && commentId) {
      setComments(
        comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: comment.replies.map((reply) => {
                if (reply.id === id) {
                  return {
                    ...reply,
                    likes: reply.userLiked ? reply.likes - 1 : reply.likes + 1,
                    userLiked: !reply.userLiked,
                  }
                }
                return reply
              }),
            }
          }
          return comment
        }),
      )
    } else {
      setComments(
        comments.map((comment) => {
          if (comment.id === id) {
            return {
              ...comment,
              likes: comment.userLiked ? comment.likes - 1 : comment.likes + 1,
              userLiked: !comment.userLiked,
            }
          }
          return comment
        }),
      )
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Community Discussion</h2>

      {user ? (
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || "/placeholder.svg?height=40&width=40"} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder={`Share your thoughts about this ${type}...`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-24 resize-none"
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmitComment} disabled={!comment.trim()}>
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border p-4 text-center">
          <p className="text-muted-foreground">
            Please{" "}
            <Button variant="link" className="h-auto p-0">
              sign in
            </Button>{" "}
            to join the conversation.
          </p>
        </div>
      )}

      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={comment.userImage || "/placeholder.svg?height=40&width=40"}
                        alt={comment.userName}
                      />
                      <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{comment.userName}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{comment.content}</p>
                      <div className="mt-2 flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1"
                          onClick={() => toggleLike(comment.id, false)}
                        >
                          <ThumbsUp
                            className={`mr-1 h-4 w-4 ${comment.userLiked ? "fill-primary text-primary" : ""}`}
                          />
                          <span className="text-xs">{comment.likes}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        >
                          <MessageSquare className="mr-1 h-4 w-4" />
                          <span className="text-xs">Reply</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Report</DropdownMenuItem>
                      {user && user.id === comment.userId && (
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {replyingTo === comment.id && user && (
                <div className="ml-12 mt-2 flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || "/placeholder.svg?height=32&width=32"} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-20 resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleSubmitReply(comment.id)} disabled={!replyContent.trim()}>
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {comment.replies.length > 0 && (
                <div className="ml-12 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={reply.userImage || "/placeholder.svg?height=32&width=32"}
                              alt={reply.userName}
                            />
                            <AvatarFallback>{reply.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{reply.userName}</h4>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(reply.createdAt, { addSuffix: true })}
                              </span>
                            </div>
                            <p className="mt-1 text-sm">{reply.content}</p>
                            <div className="mt-2 flex items-center gap-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1"
                                onClick={() => toggleLike(reply.id, true, comment.id)}
                              >
                                <ThumbsUp
                                  className={`mr-1 h-4 w-4 ${reply.userLiked ? "fill-primary text-primary" : ""}`}
                                />
                                <span className="text-xs">{reply.likes}</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Report</DropdownMenuItem>
                            {user && user.id === reply.userId && (
                              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Separator />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border p-6 text-center">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-2 font-medium">No comments yet</h3>
          <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  )
}
