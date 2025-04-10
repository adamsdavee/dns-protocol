import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Globe } from "lucide-react"

interface DomainCardProps {
  domain: string
}

export function DomainCard({ domain }: DomainCardProps) {
  // Mock data - in a real app, you would fetch this from the blockchain
  const expiryDate = new Date()
  expiryDate.setFullYear(expiryDate.getFullYear() + 1)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="truncate">{domain}</CardTitle>
          <Badge variant="outline" className="ml-2">
            Active
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Expires: {expiryDate.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Primary Domain</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          Manage
        </Button>
        <Button variant="outline" size="sm">
          Renew
        </Button>
      </CardFooter>
    </Card>
  )
}
