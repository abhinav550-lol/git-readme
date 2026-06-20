import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

function LoadingComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardContent className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoadingComponent
