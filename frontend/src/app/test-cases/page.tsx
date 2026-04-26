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
import { testCaseApi } from "@/lib/api"

export default function TestCasesPage() {
  const [testCases, setTestCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
              <div className="text-center py-12">Loading test cases...</div>
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
