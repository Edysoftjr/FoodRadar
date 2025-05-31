"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Play, Plus, Type, X, Settings, Upload, Trash2, Video, Image as ImageIcon, ZoomIn, ArrowLeft, Users, Star, MapPin, Loader2, Check } from "lucide-react"
import { BottomNavbar } from "@/components/bottom-navbar"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils" // Assuming you have a utility for class names
import { Heart, Share, MoreHorizontal, Smile } from "lucide-react" // Added X icon

// ... (Type definitions remain the same as your provided code) ...

type StatusStory = {
  id: string
  user: {
    id: string
    name: string
    image?: string
    type: "USER" | "RESTAURANT"
  }
  hasUnread: boolean
  lastUpdated: string
}

type StatusPost = {
  id: string
  user: {
    id: string
    name: string
    image?: string
    type: "USER" | "RESTAURANT"
    location?: string
  }
  content: {
    type: "image" | "video" | "text"
    url?: string
    text?: string
    caption?: string
  }
  timestamp: string
  expiresAt: string
  views: number
}

type SuggestedFollow = {
  id: string
  name: string
  image?: string
  type: "USER" | "RESTAURANT"
  mutualConnections?: number
  category?: string
  rating?: number
}

type MediaFile = {
  id: string
  file: File
  url: string
  type: "image" | "video"
}

type StorySequence = {
  storyUserId: string
  posts: StatusPost[]
  currentPostIndex: number
}

const CREATE_STATUS_MODAL_HISTORY_KEY = "createStatusModalOpen";
const STORY_VIEWER_HISTORY_KEY = "storyViewerOpen";
const ZOOMED_MEDIA_HISTORY_KEY = "zoomedMediaOpen";


export default function StatusPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [stories, setStories] = useState<StatusStory[]>([])
  const [suggestedFollows, setSuggestedFollows] = useState<SuggestedFollow[]>([])

  const [allStorySequences, setAllStorySequences] = useState<StorySequence[]>([])
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0)
  const [showStoryViewer, setShowStoryViewer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingStories, setLoadingStories] = useState(false)

  const [showCreateStatus, setShowCreateStatus] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [zoomedMedia, setZoomedMedia] = useState<MediaFile | null>(null)

  const [statusType, setStatusType] = useState<"text" | "media">("text")
  const [statusText, setStatusText] = useState("")
  const [statusCaption, setStatusCaption] = useState("")
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showViewList, setShowViewList] = useState(true)
  const [allowReplies, setAllowReplies] = useState(true)
  const [saveToArchive, setSaveToArchive] = useState(true)

  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        setLoading(true)
        const [storiesRes, suggestedRes] = await Promise.all([
          fetch("/api/status/stories"),
          fetch("/api/status/suggested"),
        ])

        if (storiesRes.ok) {
          const storiesData = await storiesRes.json()
          setStories(storiesData.stories || [])
        }

        if (suggestedRes.ok) {
          const suggestedData = await suggestedRes.json()
          setSuggestedFollows(suggestedData.suggested || [])
        }
      } catch (error) {
        console.error("Error fetching status data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatusData()
  }, [])


  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach(file => {
      const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'image';
      const url = URL.createObjectURL(file)

      const newMediaFile: MediaFile = {
        id: Date.now().toString() + Math.random().toString(),
        file,
        url,
        type: fileType as 'image' | 'video'
      }

      setMediaFiles(prev => [...prev, newMediaFile])
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    if (files.length > 0) {
        setStatusType("media");
        setShowCreateStatus(true);
    }
  }

  const removeMediaFile = (id: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const loadAllStoriesInSequence = async () => {
    if (stories.length === 0) return

    try {
      setLoadingStories(true)
      const sequences: StorySequence[] = []

      for (const story of stories) {
        try {
          const response = await fetch(`/api/status/stories/${story.user.id}`)
          if (response.ok) {
            const data = await response.json()
            if (data.posts && data.posts.length > 0) {
              sequences.push({
                storyUserId: story.user.id,
                posts: data.posts,
                currentPostIndex: 0
              })
            }
          }
        } catch (error) {
          console.error(`Error fetching stories for user ${story.user.id}:`, error)
        }
      }

      setAllStorySequences(sequences)
      setCurrentSequenceIndex(0)

      if (sequences.length > 0) {
        setShowStoryViewer(true)
      }
    } catch (error) {
      console.error("Error loading story sequences:", error)
    } finally {
      setLoadingStories(false)
    }
  }

  const handleStoryClick = async (storyUserId: string) => {
    const storyIndex = stories.findIndex(story => story.user.id === storyUserId)
    if (storyIndex === -1) return;

    const existingSequenceIndex = allStorySequences.findIndex(seq => seq.storyUserId === storyUserId);
    if (allStorySequences.length > 0 && existingSequenceIndex !== -1) {
      setCurrentSequenceIndex(existingSequenceIndex);
      setAllStorySequences(prev => prev.map((seq, index) =>
        index === existingSequenceIndex ? { ...seq, currentPostIndex: 0 } : seq
      ));
      setShowStoryViewer(true);
    } else {
      setLoadingStories(true);
      try {
        const sequences: StorySequence[] = [];
        for (const story of stories) {
          const response = await fetch(`/api/status/stories/${story.user.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.posts && data.posts.length > 0) {
              sequences.push({
                storyUserId: story.user.id,
                posts: data.posts,
                currentPostIndex: 0,
              });
            }
          }
        }
        setAllStorySequences(sequences);
        const newClickedSequenceIndex = sequences.findIndex(seq => seq.storyUserId === storyUserId);
        if (newClickedSequenceIndex !== -1) {
          setCurrentSequenceIndex(newClickedSequenceIndex);
          setShowStoryViewer(true);
        } else if (sequences.length > 0) {
          setCurrentSequenceIndex(0);
          setShowStoryViewer(true);
        }
      } catch (error) {
        console.error("Error loading specific story sequence:", error);
      } finally {
        setLoadingStories(false);
      }
    }
  }

  // Effect for Story Viewer history management
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (showStoryViewer && (!event.state || !event.state[STORY_VIEWER_HISTORY_KEY])) {
          setShowStoryViewer(false);
      }
    };

    if (showStoryViewer) {
      if (!window.history.state || !window.history.state[STORY_VIEWER_HISTORY_KEY]) {
        window.history.pushState({ [STORY_VIEWER_HISTORY_KEY]: true }, "", window.location.href);
      }
      window.addEventListener('popstate', handlePopState);
      document.body.style.overflow = 'hidden';
    } else {
      if (window.history.state && window.history.state[STORY_VIEWER_HISTORY_KEY]) {
        window.history.back();
      }
      if (!showCreateStatus && !zoomedMedia) { // Check other modals
        document.body.style.overflow = 'auto';
      }
    }
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (!showCreateStatus && !showStoryViewer && !zoomedMedia && (window.history.state && !window.history.state[STORY_VIEWER_HISTORY_KEY])) {
         document.body.style.overflow = 'auto';
      }
    };
  }, [showStoryViewer, showCreateStatus, zoomedMedia]);


  // Effect for Create Status Modal history management
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (showCreateStatus && (!event.state || !event.state[CREATE_STATUS_MODAL_HISTORY_KEY])) {
        setShowCreateStatus(false);
      }
    };

    if (showCreateStatus) {
      if (!window.history.state || !window.history.state[CREATE_STATUS_MODAL_HISTORY_KEY]) {
        window.history.pushState({ [CREATE_STATUS_MODAL_HISTORY_KEY]: true }, "", window.location.href);
      }
      window.addEventListener('popstate', handlePopState);
      document.body.style.overflow = 'hidden';
    } else {
      // Cleanup when showCreateStatus becomes false
      setMediaFiles([]);
      setStatusText("");
      setStatusCaption("");
      setStatusType("text");

      if (window.history.state && window.history.state[CREATE_STATUS_MODAL_HISTORY_KEY]) {
        window.removeEventListener('popstate', handlePopState);
        window.history.back();
      }
      if (!showStoryViewer && !zoomedMedia) {
        document.body.style.overflow = 'auto';
      }
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (!showStoryViewer && !showCreateStatus && !zoomedMedia && (window.history.state && !window.history.state[CREATE_STATUS_MODAL_HISTORY_KEY])) {
        document.body.style.overflow = 'auto';
      }
    };
  }, [showCreateStatus, showStoryViewer, zoomedMedia]);

  // Effect for Zoomed Media history management
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
        if (zoomedMedia && (!event.state || !event.state[ZOOMED_MEDIA_HISTORY_KEY])) {
            setZoomedMedia(null);
        }
    };

    if (zoomedMedia) {
        if (!window.history.state || !window.history.state[ZOOMED_MEDIA_HISTORY_KEY]) {
            window.history.pushState({ [ZOOMED_MEDIA_HISTORY_KEY]: true }, "", window.location.href);
        }
        window.addEventListener('popstate', handlePopState);
        document.body.style.overflow = 'hidden';
    } else {
        if (window.history.state && window.history.state[ZOOMED_MEDIA_HISTORY_KEY]) {
            window.removeEventListener('popstate', handlePopState);
            window.history.back();
        }
        if (!showStoryViewer && !showCreateStatus) {
            document.body.style.overflow = 'auto';
        }
    }

    return () => {
        window.removeEventListener('popstate', handlePopState);
        if (!showStoryViewer && !showCreateStatus && !zoomedMedia && (window.history.state && !window.history.state[ZOOMED_MEDIA_HISTORY_KEY])) {
           document.body.style.overflow = 'auto';
        }
    };
  }, [zoomedMedia, showCreateStatus, showStoryViewer]);


  const handleCreateStatus = async () => {
    if (!statusText.trim() && mediaFiles.length === 0) {
      toast({
        title: "Cannot post empty status",
        description: "Please add text or select media to post.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData()
      formData.append("type", statusType)
      if (statusText && statusType === "text") formData.append("text", statusText);
      if (statusCaption && statusType === "media") formData.append("caption", statusCaption);

      if (statusType === "media" && mediaFiles.length > 0) {
        mediaFiles.forEach((mediaFile) => {
          formData.append(`files`, mediaFile.file)
        })
      } else if (statusType === "media" && mediaFiles.length === 0) {
         toast({
            title: "No media selected",
            description: "Please select media files for a media status.",
            variant: "destructive",
         });
         return;
      }

      const response = await fetch("/api/status/create", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Status posted!",
          description: "Your status has been shared successfully",
        })
        setShowCreateStatus(false)
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to post status");
      }
    } catch (error: any) {
      console.error("Error creating status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to post status",
        variant: "destructive",
      })
    }
  }

  const handleFollow = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      })

      if (response.ok) {
        setSuggestedFollows((prev) => prev.filter((user) => user.id !== userId))
        toast({
          title: "Following!",
          description: "You are now following this user",
        })
      }
    } catch (error) {
      console.error("Error following user:", error)
    }
  }

  const moveToNextStory = () => {
    const currentSequence = allStorySequences[currentSequenceIndex]
    if (!currentSequence) return

    if (currentSequence.currentPostIndex < currentSequence.posts.length - 1) {
      setAllStorySequences(prev =>
        prev.map((seq, index) =>
          index === currentSequenceIndex
            ? { ...seq, currentPostIndex: seq.currentPostIndex + 1 }
            : seq
        )
      )
    } else {
      if (currentSequenceIndex < allStorySequences.length - 1) {
        setCurrentSequenceIndex(currentSequenceIndex + 1)
      } else {
        setShowStoryViewer(false)
      }
    }
  }

  const moveToPrevStory = () => {
    const currentSequence = allStorySequences[currentSequenceIndex]
    if (!currentSequence) return

    if (currentSequence.currentPostIndex > 0) {
      setAllStorySequences(prev =>
        prev.map((seq, index) =>
          index === currentSequenceIndex
            ? { ...seq, currentPostIndex: seq.currentPostIndex - 1 }
            : seq
        )
      )
    } else {
      if (currentSequenceIndex > 0) {
        const prevSequenceIndex = currentSequenceIndex - 1
        const newPrevSequence = allStorySequences[prevSequenceIndex];
        if (newPrevSequence) {
            setAllStorySequences(prev =>
                prev.map((seq, index) =>
                    index === prevSequenceIndex
                        ? { ...seq, currentPostIndex: newPrevSequence.posts.length - 1 }
                        : seq
                )
            );
            setCurrentSequenceIndex(prevSequenceIndex);
        }
      }
    }
  }

  const handleViewAllStories = async () => {
    await loadAllStoriesInSequence()
  }

  const handleSaveSettings = () => {
    console.log("Saving settings:", { showViewList, allowReplies, saveToArchive });
    toast({
      title: "Settings saved!",
      description: "Your preferences have been updated",
    })
    setShowSettings(false)
  }

  const handleCreateStatusModalOpenChange = (isOpen: boolean) => {
    if (isOpen) {
        setShowCreateStatus(true);
    } else {
        if (window.history.state && window.history.state[CREATE_STATUS_MODAL_HISTORY_KEY]) {
            window.history.back();
        } else {
            setShowCreateStatus(false);
        }
    }
  };

  const handleStoryViewerOpenChange = (isOpen: boolean) => {
    if (isOpen) {
        setShowStoryViewer(true);
    } else {
        if (window.history.state && window.history.state[STORY_VIEWER_HISTORY_KEY]) {
            window.history.back();
        } else {
            setShowStoryViewer(false);
        }
    }
  };

  const handleZoomedMediaOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        if (window.history.state && window.history.state[ZOOMED_MEDIA_HISTORY_KEY]) {
            window.history.back();
        } else {
            setZoomedMedia(null);
        }
    }
  };


  if (!user) {
    return (
     <div className="flex min-h-screen flex-col items-center justify-center pb-16 bg-muted/40">
        <div className="text-center p-8 m-2 bg-background rounded-lg shadow-md">
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">View Status</h2>
          <p className="text-muted-foreground mb-4">Sign in to see what your followed restaurants and friends are sharing.</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
        <BottomNavbar />
      </div>
    )
  }

  const currentSequence = allStorySequences[currentSequenceIndex]
  const currentPost = currentSequence?.posts[currentSequence.currentPostIndex]

  return (
    <div className="flex min-h-screen flex-col pb-16 bg-muted/40">
      <header className="sticky top-0 z-10 mb-1 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          <div className="flex items-center gap-3">
            <Image
              alt="FoodRadar App"
              src="/foodrlogo.png"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
            <span className="text-xl font-bold">Status</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="h-9 w-9 p-0"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
<div className="mb-6">
          <div className="container px-4 mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Stories</h2>
              {stories.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleViewAllStories}
                  disabled={loadingStories}
                  className="text-primary hover:text-primary/80"
                >
                  {loadingStories ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Play className="h-4 w-4 mr-1.5" />} View All
                </Button>
              )}
            </div>
          </div>
          {/* Horizontal Scroll for Stories */}
          <div className="relative">
             <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 px-4 container mx-auto max-w-6xl">
                {/* Your Status */}
                <div className="flex-shrink-0 text-center w-20">
                  <button
                    onClick={() => handleCreateStatusModalOpenChange(true)}
                    className="flex flex-col items-center gap-1.5 group"
                    aria-label="Create new status"
                  >
                    <div className="relative h-16 w-16">
                      <Avatar className="h-16 w-16 border-2 border-dashed border-muted-foreground/50 group-hover:border-primary transition-colors duration-200">
                        <AvatarImage src={user.image || ""} alt={user.name || "Your avatar"}/>
                        <AvatarFallback>{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 border-2 border-background shadow-sm group-hover:scale-110 transition-transform duration-200">
                        <Plus className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200 max-w-full truncate">Your Status</span>
                  </button>
                </div>

                {/* Other Stories */}
                {stories.map((story) => (
                  <div key={story.id} className="flex-shrink-0 text-center w-20">
                    <button
                      onClick={() => handleStoryClick(story.user.id)}
                      className="flex flex-col items-center gap-1.5 group"
                      aria-label={`View status from ${story.user.name}`}
                    >
                      <div className={`relative h-16 w-16 rounded-full p-0.5 bg-gradient-to-tr ${ story.hasUnread ? 'from-yellow-400 via-red-500 to-purple-600' : 'from-muted/50 to-muted/50' } group-hover:scale-105 transition-transform duration-200`}>
                        <Avatar className="h-full w-full border-2 border-background">
                          <AvatarImage src={story.user.image || "/placeholder.svg"} alt={story.user.name}/>
                          <AvatarFallback>
                            {story.user.type === "RESTAURANT" ? <MapPin className="h-5 w-5"/> : story.user.name?.[0]?.toUpperCase() || "U"}
                          
                          </AvatarFallback>
                        </Avatar>
                        {story.user.type === "RESTAURANT" && (
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center
                                        bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-white text-white shadow-md">
                          <span className="text-sm">🍽️</span>
                        </div>
                      )}
                      </div>
                      <span className="text-xs font-medium text-foreground max-w-full truncate">{story.user.name}</span>
                    </button>
                  </div>
                ))}
                {/* Add padding at the end if needed */}
                <div className="flex-shrink-0 w-1"></div>
             </div>
             {/* Optional: Add fade effect at edges if desired */}
          </div>
        </div>


        <div className="container px-4 py-6 mx-auto max-w-6xl bg-background rounded-t-lg shadow-sm border-t">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-1">Discover</h2>
            <p className="text-sm text-muted-foreground">People and restaurants you might like.</p>
          </div>

          {loading ? (
           <div className="flex flex-col items-center justify-center py-16 text-center bg-background rounded-lg shadow-sm">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
              <p className="text-lg font-medium text-muted-foreground">Loading...</p>
              <p className="text-sm text-muted-foreground/80">Please wait a moment.</p>
            </div>

          ) : suggestedFollows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                <p>No suggestions right now.</p>
                <p className="text-sm">Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedFollows.map((suggestion) => (
                <Card key={suggestion.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4 flex items-center gap-4">
                   <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={suggestion.image || "/placeholder.svg"} alt={suggestion.name}/>
                      <AvatarFallback>
                        {suggestion.type === "RESTAURANT" ? <MapPin className="h-5 w-5"/> : suggestion.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {suggestion.type === "RESTAURANT" && (
                          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center
                                          bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-white text-white shadow-sm">
                            <span className="text-sm">🍽️</span>
                          </div>
                        )}
                      </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate mb-0.5">{suggestion.name}</h3>
                      <div className="text-xs text-muted-foreground space-x-1.5 truncate">
                        {suggestion.type === "RESTAURANT" && suggestion.category && (
                          <span>{suggestion.category}</span>
                        )}
                        {suggestion.type === "RESTAURANT" && suggestion.rating && (
                          <span className="inline-flex items-center"><Star className="h-3 w-3 mr-0.5 fill-yellow-400 text-yellow-500"/> {suggestion.rating.toFixed(1)}</span>
                        )}
                        {suggestion.type === "USER" && suggestion.mutualConnections && (
                          <span>{suggestion.mutualConnections} mutual</span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleFollow(suggestion.id)} className="ml-auto flex-shrink-0">
                      <Plus className="h-4 w-4 mr-1 -ml-1"/> Follow
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {showStoryViewer && currentPost && (
        <SynchronousStoryViewer
          allSequences={allStorySequences}
          currentSequenceIndex={currentSequenceIndex}
          onNext={moveToNextStory}
          onPrev={moveToPrevStory}
          onClose={() => handleStoryViewerOpenChange(false)}
        />
      )}

      {/* Create Status Modal (Redesigned) */}
      <Dialog open={showCreateStatus} onOpenChange={handleCreateStatusModalOpenChange}>
        <DialogContent
            className="p-0 flex flex-col overflow-hidden bg-background shadow-xl w-full sm:w-[90vw] sm:max-w-3xl h-full sm:h-[calc(100vh-6rem)] sm:max-h-[700px] rounded-none sm:rounded-lg"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-row justify-between items-center">
            <DialogTitle className="text-2xl font-bold">Create Status</DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div className="md:w-1/2 flex flex-col p-4 border-r md:border-r-gray-200 dark:md:border-r-gray-700 md:border-b-0 overflow-hidden">
              <h3 className="font-semibold text-lg mb-3">Your Media</h3>
              {/* MODIFIED LINE: justify-center changed to justify-start */}
              <div className="flex-1 flex flex-col items-center justify-start bg-muted/20 rounded-lg overflow-y-auto p-4 relative min-h-[calc(theme(spacing.60)_+_2rem)]">
                {mediaFiles.length === 0 ? (
                  <div onClick={() => fileInputRef.current?.click()} className="text-center text-muted-foreground flex flex-col items-center justify-center h-full"> {/* Ensure message is centered if container is tall */}
                    <p className="mb-2">No media selected.</p>
                    <Button
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Media
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 w-full mb-11">
                    {mediaFiles.map((media) => (
                      <div key={media.id} className="relative w-full h-60 rounded-lg overflow-hidden border border-muted">
                        {media.type === 'image' ? (
                          <Image
                            src={media.url}
                            alt="Preview"
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 30vw, 25vw"
                            className="object-cover"
                          />
                        ) : (
                          <video src={media.url} controls className="w-full h-full object-cover" />
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-7 w-7 rounded-full text-white bg-red-500/80 hover:bg-red-600/90"
                          onClick={() => removeMediaFile(media.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute bottom-1 right-1 h-7 w-7 rounded-full text-white bg-blue-500/80 hover:bg-blue-600/90"
                          onClick={() => setZoomedMedia(media)}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div onClick={() => fileInputRef.current?.click()} className="w-full h-60 flex items-center justify-center border-2 border-dashed border-muted-foreground/50 rounded-lg">
                      <Button variant="ghost" size="icon" className="h-16 w-16">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-1/2 flex flex-col p-4">
              <h3 className="font-semibold text-lg mb-3">Details</h3>
              <div className="mb-4 flex gap-2">
                <Button
                  variant={statusType === "text" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusType("text")}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Text Status
                </Button>
                <Button
                  variant={statusType === "media" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusType("media")}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Media Status
                </Button>
              </div>

              {statusType === "text" ? (
                <Textarea
                  placeholder="What's on your mind? Share your thoughts!"
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  className="flex-1 min-h-[140px] text-lg p-4"
                />
              ) : (
                <Textarea
                  placeholder="Add a caption to your media..."
                  value={statusCaption}
                  onChange={(e) => setStatusCaption(e.target.value)}
                  className="flex-1 min-h-[100px] p-4"
                />
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-background">
            <Button
              onClick={handleCreateStatus}
              className="w-full md:w-auto"
              disabled={(statusType === 'text' && !statusText.trim()) && (statusType === 'media' && mediaFiles.length === 0)}
            >
              Share Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={(e) => handleFileUpload(e.target.files)}
        ref={fileInputRef}
        className="hidden"
        style={{ display: 'none' }}
      />

      <Dialog open={!!zoomedMedia} onOpenChange={handleZoomedMediaOpenChange}>
        <DialogContent className="sm:max-w-3xl lg:max-w-4xl h-[90vh] flex flex-col p-0 [&>button[aria-label='Close']]:hidden">
          <DialogHeader className="px-6 pt-6 pb-4 flex-row items-center justify-between">
            <DialogTitle className="text-center flex-1">Media Preview</DialogTitle>
            <div className="w-9 h-9"></div> {/* Spacer */}
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center p-4 bg-black">
            {zoomedMedia?.type === 'image' ? (
              <Image
                src={zoomedMedia.url}
                alt="Zoomed Preview"
                fill
                sizes="100vw"
                className="object-contain"
              />
            ) : (
              <video src={zoomedMedia?.url} controls autoPlay className="w-full h-full object-contain" />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Status Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="showViewListCheckbox" className="text-sm">Show Viewers of my Status</label>
                <input
                  id="showViewListCheckbox"
                  type="checkbox"
                  checked={showViewList}
                  onChange={(e) => setShowViewList(e.target.checked)}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="allowRepliesCheckbox" className="text-sm">Allow Replies to my Status</label>
                <input
                  id="allowRepliesCheckbox"
                  type="checkbox"
                  checked={allowReplies}
                  onChange={(e) => setAllowReplies(e.target.checked)}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="saveToArchiveCheckbox" className="text-sm">Save to Archive</label>
                <input
                  id="saveToArchiveCheckbox"
                  type="checkbox"
                  checked={saveToArchive}
                  onChange={(e) => setSaveToArchive(e.target.checked)}
                  className="rounded"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSettings(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSaveSettings}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavbar />
    </div>
  )
}


function SynchronousStoryViewer({
  allSequences,
  currentSequenceIndex,
  onNext,
  onPrev,
  onClose,
}: {
  allSequences: StorySequence[]
  currentSequenceIndex: number
  onNext: () => void
  onPrev: () => void
  onClose: () => void
}) {
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const startTimeRef = useRef<number>(0)
  const pausedProgressRef = useRef<number>(0)

  const currentSequence = allSequences[currentSequenceIndex]
  if (!currentSequence) return null

  const currentStory = currentSequence.posts[currentSequence.currentPostIndex]
  if (!currentStory) return null

  const totalStoriesInAllSequences = allSequences.reduce((sum, seq) => sum + seq.posts.length, 0)
  const completedStoriesOverall = allSequences.slice(0, currentSequenceIndex).reduce((sum, seq) => sum + seq.posts.length, 0) + currentSequence.currentPostIndex
  const overallProgress = totalStoriesInAllSequences > 0 ? ((completedStoriesOverall +1) / totalStoriesInAllSequences) * 100 : 0


  useEffect(() => {
    // Reset progress and state when the current story changes
    setProgress(0)
    setIsPaused(false)
    startTimeRef.current = 0
    pausedProgressRef.current = 0

    // Important: For video stories, we rely on video events for progress.
    // Ensure the video is reset and ready to play.
    const videoElement = videoRef.current;
    if (currentStory.content.type === 'video' && videoElement) {
      videoElement.currentTime = 0; // Reset video to start
      videoElement.load(); // Reload video to ensure metadata is fresh
      if (!isPaused) { // If not paused, try to play immediately
        videoElement.play().catch(error => console.warn("Video play interrupted on story change:", error));
      }
    }
  }, [currentSequenceIndex, currentSequence.currentPostIndex, currentStory.content.type, currentStory.content.url]); // Added currentStory.content.type and url to dependency array


  useEffect(() => {
    if (isPaused || !currentStory) {
      return;
    }

    let animationFrameId: number;
    const duration = currentStory.content.type === 'video'
      ? (videoRef.current?.duration ? videoRef.current.duration * 1000 : 15000) // Default to 15s for video if duration not available yet
      : 5000; // 5 seconds for image/text

    // This block is for text/image stories. Video progress is handled by video events.
    if (currentStory.content.type !== 'video') {
      const animateProgress = (timestamp: number) => {
        if (startTimeRef.current === 0) {
          startTimeRef.current = timestamp - (pausedProgressRef.current / 100) * duration;
        }

        const elapsedTime = timestamp - startTimeRef.current;
        const newProgress = Math.min((elapsedTime / duration) * 100, 100);
        setProgress(newProgress);

        if (newProgress < 100) {
          animationFrameId = requestAnimationFrame(animateProgress);
        } else {
          onNext();
        }
      };
      animationFrameId = requestAnimationFrame(animateProgress);
    } else {
      // For videos, ensure progress is driven by video time updates
      // This is crucial if the video was paused and then resumed, or if it didn't play initially
      const videoElement = videoRef.current;
      if (videoElement && videoElement.duration && !isPaused) {
        // If progress was saved, set current time to resume from that point
        if (pausedProgressRef.current > 0) {
          videoElement.currentTime = (pausedProgressRef.current / 100) * videoElement.duration;
        }
        videoElement.play().catch(error => console.warn("Video play interrupted on resume:", error));
      }
    }


    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentSequenceIndex, currentSequence.currentPostIndex, onNext, isPaused, currentStory.content.type, currentStory.content.url]); // Add currentStory.content.type and url to dependencies


  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('video, button')) return;
    setIsPaused(true);
    pausedProgressRef.current = progress; // Save current progress when paused
    // For videos, pause the video explicitly on touch/mouse down
    if (currentStory.content.type === 'video' && videoRef.current) {
      videoRef.current.pause();
    }
  }, [progress, currentStory.content.type]); // Add currentStory.content.type to dependencies

  const handleTouchEnd = useCallback(() => {
    setIsPaused(false);
    startTimeRef.current = 0; // Reset startTime to recalculate on resume
    // For videos, play the video explicitly on touch/mouse up
    if (currentStory.content.type === 'video' && videoRef.current) {
      videoRef.current.play().catch(error => console.warn("Video play interrupted on touch end:", error));
    }
  }, [currentStory.content.type]); // Add currentStory.content.type to dependencies

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('video, button')) return;
    setIsPaused(true);
    pausedProgressRef.current = progress; // Save current progress when paused
    // For videos, pause the video explicitly on touch/mouse down
    if (currentStory.content.type === 'video' && videoRef.current) {
      videoRef.current.pause();
    }
  }, [progress, currentStory.content.type]); // Add currentStory.content.type to dependencies

  const handleMouseUp = useCallback(() => {
    setIsPaused(false);
    startTimeRef.current = 0; // Reset startTime to recalculate on resume
    // For videos, play the video explicitly on touch/mouse up
    if (currentStory.content.type === 'video' && videoRef.current) {
      videoRef.current.play().catch(error => console.warn("Video play interrupted on mouse up:", error));
    }
  }, [currentStory.content.type]); // Add currentStory.content.type to dependencies


  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && currentStory.content.type === 'video' && currentStory.content.url) {
      if (isPaused) {
        videoElement.pause();
      } else {
        // Only attempt to play if it's not already playing or has ended
        if (videoElement.paused || videoElement.ended) {
          videoElement.play().catch(error => console.warn("Video play interrupted:", error));
        }
      }
    }
  }, [isPaused, currentStory?.content.type, currentStory?.content.url]); // Ensure these are dependencies

  const handleVideoTimeUpdate = useCallback(() => {
    if (videoRef.current && videoRef.current.duration) {
      const newProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(newProgress);
    }
  }, []);

  const handleVideoLoadedData = useCallback(() => {
    // This fires when video metadata (like duration) is loaded.
    // Ensure we attempt to play here if not paused, and reset progress if needed.
    if (videoRef.current && videoRef.current.duration && !isPaused) {
        // If the video just loaded, ensure it starts from 0 or its paused point
        if (videoRef.current.currentTime === 0 && pausedProgressRef.current === 0) {
            setProgress(0); // Ensure progress is at 0 when video truly starts
        }
        videoRef.current.play().catch(error => console.warn("Video play interrupted on load:", error));
    }
  }, [isPaused]);


  const handleVideoEnded = useCallback(() => {
    onNext();
  }, [onNext]);


  return (
    <div
      className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute top-3 left-4 right-4 z-20">
         <div className="h-1 bg-white/20 rounded-full w-full">
            <div
              className="h-full bg-white/60 transition-all duration-300 ease-linear rounded-full"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
      </div>

      <div className="absolute top-6 left-4 right-4 flex gap-1 z-20 pt-1">
        {currentSequence.posts.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-width ease-linear"
              style={{
                width: index < currentSequence.currentPostIndex ? "100%" :
                       index === currentSequence.currentPostIndex ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      <div className="absolute top-10 left-4 right-4 flex items-center justify-between text-white z-20 pt-2">
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white/80">
            <AvatarImage src={currentStory.user.image || "/placeholder.svg"} />
            <AvatarFallback>{currentStory.user.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
            <div>
                <h3 className="font-semibold text-sm">{currentStory.user.name}</h3>
                <p className="text-xs opacity-80">{new Date(currentStory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            {currentStory.user.type === "RESTAURANT" && (
                <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-sm">🍽️</span>
            )}
            </div>
        </div>
        <button onClick={onClose} className="p-2">
            <X className="h-6 w-6 text-white" />
        </button>
      </div>

      <div className="absolute left-0 top-0 w-[30%] h-full z-10" onClick={onPrev} />
      <div className="absolute right-0 top-0 w-[30%] h-full z-10" onClick={onNext} />


      <div className="w-full h-full flex items-center justify-center relative z-0 pt-[70px] pb-[70px]">
        {currentStory.content.type === "text" && (
          <div className="text-white text-center p-8 flex items-center justify-center max-w-md mx-auto">
            <p className="text-3xl font-semibold whitespace-pre-wrap break-words">{currentStory.content.text}</p>
          </div>
        )}

        {currentStory.content.type === "image" && currentStory.content.url && (
          <img
            src={currentStory.content.url}
            alt={currentStory.content.caption || "Story Image"}
            className="max-w-full max-h-full object-contain"
          />
        )}

        {currentStory.content.type === "video" && currentStory.content.url && (
            <video
                ref={videoRef}
                src={currentStory.content.url}
                className="max-w-full max-h-full object-contain"
                autoPlay
                muted
                playsInline
                onLoadedData={handleVideoLoadedData}
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                onClick={(e) => e.stopPropagation()} // Prevent parent's touch/mouse events on video itself
            />
        )}
      </div>

      {currentStory.content.caption && (
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-white text-center px-4 w-full max-w-md z-20">
          <p className="text-base bg-black/60 px-3 py-2 rounded-lg whitespace-pre-wrap break-words">
            {currentStory.content.caption}
          </p>
        </div>
      )}
    </div>
  )
}
