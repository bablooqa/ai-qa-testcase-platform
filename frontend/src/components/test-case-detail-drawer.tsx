"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  FileText, 
  Play, 
  Bot, 
  MessageSquare, 
  History, 
  Code, 
  CheckCircle, 
  XCircle, 
  Clock,
  Send
} from "lucide-react"

interface TestCaseDetailDrawerProps {
  testCase: {
    id: number
    title: string
    description: string
    steps: string
    expectedResult: string
    priority: string
    status: string
    tags: string[]
    assignedTo: string | null
    createdBy: string
    createdAt: string
  }
  children: React.ReactNode
}

export function TestCaseDetailDrawer({ testCase, children }: TestCaseDetailDrawerProps) {
  const comments = [
    {
      id: 1,
      user: "John Doe",
      avatar: "JD",
      content: "This test case needs to cover edge cases for empty inputs.",
      time: "2 hours ago"
    },
    {
      id: 2,
      user: "Jane Smith",
      avatar: "JS",
      content: "Added validation steps for email format.",
      time: "1 day ago"
    }
  ]

  const executions = [
    {
      id: 1,
      status: "pass",
      executedBy: "John Doe",
      executedAt: "2 hours ago",
      environment: "Chrome on Windows",
      comments: "All steps passed successfully"
    },
    {
      id: 2,
      status: "fail",
      executedBy: "Jane Smith",
      executedAt: "1 day ago",
      environment: "Firefox on Mac",
      comments: "Step 3 failed - timeout error"
    }
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-[800px] sm:w-[1000px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>TC-{String(testCase.id).padStart(4, '0')}: {testCase.title}</span>
            <div className="flex gap-2">
              <Badge variant={
                testCase.priority === 'critical' ? 'destructive' :
                testCase.priority === 'high' ? 'default' :
                testCase.priority === 'medium' ? 'secondary' : 'outline'
              }>
                {testCase.priority}
              </Badge>
              <Badge variant="outline">{testCase.status}</Badge>
            </div>
          </SheetTitle>
          <SheetDescription>
            Created by {testCase.createdBy} on {testCase.createdAt}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <Tabs defaultValue="details" className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Test Case Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="mt-1">{testCase.description || "No description provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Steps</label>
                    <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md whitespace-pre-wrap text-sm">
                      {testCase.steps}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Expected Result</label>
                    <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md whitespace-pre-wrap text-sm">
                      {testCase.expectedResult}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {testCase.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{testCase.assignedTo?.split(' ').map(n => n[0]).join('') || 'UN'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{testCase.assignedTo || "Unassigned"}</p>
                        <p className="text-xs text-muted-foreground">Assigned to</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button size="sm">
                        <Play className="mr-2 h-4 w-4" />
                        Execute
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comments ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="Add a comment..." className="flex-1" />
                    <Button size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{comment.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{comment.user}</p>
                            <span className="text-xs text-muted-foreground">{comment.time}</span>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Execution History ({executions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {executions.map((execution) => (
                    <div key={execution.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {execution.status === 'pass' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {execution.status === 'fail' && <XCircle className="h-4 w-4 text-red-500" />}
                          <span className="font-medium capitalize">{execution.status}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{execution.executedAt}</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><span className="text-muted-foreground">Executed by:</span> {execution.executedBy}</p>
                        <p><span className="text-muted-foreground">Environment:</span> {execution.environment}</p>
                        <p><span className="text-muted-foreground">Comments:</span> {execution.comments}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="automation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Automation Script
                  </CardTitle>
                  <CardDescription>
                    AI-generated automation scripts for this test case
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Bot className="h-6 w-6" />
                      <span>Generate Playwright</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Bot className="h-6 w-6" />
                      <span>Generate Selenium</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Bot className="h-6 w-6" />
                      <span>Generate Pytest</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Bot className="h-6 w-6" />
                      <span>Generate Cypress</span>
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">No automation script generated yet</span>
                      <Badge variant="secondary">Not Generated</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Click on one of the generate buttons above to create an automation script using AI.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
