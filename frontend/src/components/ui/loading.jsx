import { Loader2 } from "lucide-react"
import { cn } from "../../lib/utils"

export function Loading({ className, size = "default", text = "Loading..." }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  )
}

export function LoadingPage({ text = "Loading..." }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Loading size="lg" text={text} />
    </div>
  )
}

export function LoadingCard({ text = "Loading..." }) {
  return (
    <div className="flex items-center justify-center p-8">
      <Loading text={text} />
    </div>
  )
}