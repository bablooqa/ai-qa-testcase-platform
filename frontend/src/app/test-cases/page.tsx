"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  FileText, 
  Play, 
  MoreHorizontal, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Bot,
  Download
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { testCaseApi } from "@/lib/api"

export default function TestCasesPage() {
  const [testCases, setTestCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTestCase, setNewTestCase] = useState({
    title: "",
    description: "",
    steps: "",
    expected_result: "",
    priority: "medium",
    status: "draft"
  })

  useEffect(() => {
    async function loadTestCases() {
      try {
        const result = await testCaseApi.list()
        if (Array.isArray(result.data)) {
          setTestCases(result.data)
        } else {
          setTestCases([])
        }
      } catch (error) {
        console.error("Failed to load test cases:", error)
        setTestCases([])
      } finally {
        setLoading(false)
      }
    }
    loadTestCases()
  }, [])

  const handleCreateTestCase = async () => {
    if (!newTestCase.title.trim() || !newTestCase.steps.trim()) return

    setCreating(true)
    try {
      const result = await testCaseApi.create({
        project_id: 1, // Default project for MVP
        title: newTestCase.title,
        description: newTestCase.description,
        steps: newTestCase.steps,
        expected_result: newTestCase.expected_result,
        priority: newTestCase.priority,
        status: newTestCase.status
      })

      if (result.data) {
        setTestCases([...testCases, result.data])
        setIsCreateDialogOpen(false)
        setNewTestCase({
          title: "",
          description: "",
          steps: "",
          expected_result: "",
          priority: "medium",
          status: "draft"
        })
      }
    } catch (error) {
      console.error("Failed to create test case:", error)
      alert("Failed to create test case. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b bg-white dark:bg-slate-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold">Test Cases</h1>
              <p className="text-sm text-muted-foreground">Manage and execute your test cases</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Create Test Case
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Test Case</DialogTitle>
                  <DialogDescription>
                    Create a new test case for your project.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter test case title"
                      value={newTestCase.title}
                      onChange={(e) => setNewTestCase({ ...newTestCase, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter test case description"
                      value={newTestCase.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTestCase({ ...newTestCase, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="steps">Steps</Label>
                    <Textarea
                      id="steps"
                      placeholder="Enter test steps (one per line)"
                      value={newTestCase.steps}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTestCase({ ...newTestCase, steps: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expected">Expected Result</Label>
                    <Textarea
                      id="expected"
                      placeholder="Enter expected result"
                      value={newTestCase.expected_result}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTestCase({ ...newTestCase, expected_result: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newTestCase.priority} onValueChange={(value) => setNewTestCase({ ...newTestCase, priority: value })}>
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={newTestCase.status} onValueChange={(value) => setNewTestCase({ ...newTestCase, status: value })}>
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="ready">Ready</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTestCase} disabled={creating}>
                    {creating ? "Creating..." : "Create Test Case"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button>
              <Bot className="mr-2 h-4 w-4" />
              Generate AI
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search test cases..." className="pl-10" />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Cases Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Test Cases</CardTitle>
            <CardDescription>{testCases.length} test cases found</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-5 flex-1" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
            ) : testCases.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No test cases found. Create test cases to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testCases.map((testCase) => (
                      <TableRow key={testCase.id}>
                        <TableCell className="font-medium">TC-{String(testCase.id).padStart(4, '0')}</TableCell>
                        <TableCell>
                          <div className="max-w-[250px]">
                            <p className="font-medium">{testCase.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{testCase.steps}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            testCase.priority === 'critical' ? 'destructive' :
                            testCase.priority === 'high' ? 'default' :
                            testCase.priority === 'medium' ? 'secondary' : 'outline'
                          }>
                            {testCase.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{testCase.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {testCase.tags && Array.isArray(testCase.tags) ? testCase.tags.map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            )) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          {testCase.assigned_to ? (
                            <span className="text-sm">Assigned</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(testCase.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Play className="mr-2 h-4 w-4" />
                                Execute Test
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Bot className="mr-2 h-4 w-4" />
                                Generate Automation
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                Edit Test Case
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
