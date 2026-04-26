"use client"

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

const testCases = [
  {
    id: 1,
    title: "User Login with Valid Credentials",
    steps: "1. Navigate to login page\n2. Enter valid email\n3. Enter valid password\n4. Click login button",
    expected: "User is redirected to dashboard",
    priority: "high",
    status: "approved",
    executionStatus: "pass",
    tags: ["smoke", "regression"],
    assignedTo: "John Doe",
    lastExecution: "2 hours ago"
  },
  {
    id: 2,
    title: "User Login with Invalid Password",
    steps: "1. Navigate to login page\n2. Enter valid email\n3. Enter invalid password\n4. Click login button",
    expected: "Error message displayed",
    priority: "high",
    status: "approved",
    executionStatus: "pass",
    tags: ["negative", "security"],
    assignedTo: "John Doe",
    lastExecution: "2 hours ago"
  },
  {
    id: 3,
    title: "User Registration - Email Validation",
    steps: "1. Navigate to registration\n2. Enter invalid email\n3. Submit form",
    expected: "Email validation error shown",
    priority: "medium",
    status: "ready",
    executionStatus: "blocked",
    tags: ["validation", "ui"],
    assignedTo: "Jane Smith",
    lastExecution: "1 day ago"
  },
  {
    id: 4,
    title: "Payment Processing - Credit Card",
    steps: "1. Add item to cart\n2. Proceed to checkout\n3. Enter credit card details\n4. Complete payment",
    expected: "Payment successful, order confirmed",
    priority: "critical",
    status: "approved",
    executionStatus: "fail",
    tags: ["critical", "payment"],
    assignedTo: "Bob Wilson",
    lastExecution: "3 hours ago"
  },
  {
    id: 5,
    title: "API Rate Limiting",
    steps: "1. Make 100 requests in 1 minute\n2. Check response status",
    expected: "429 Too Many Requests returned",
    priority: "high",
    status: "draft",
    executionStatus: null,
    tags: ["api", "performance"],
    assignedTo: null,
    lastExecution: null
  },
  {
    id: 6,
    title: "User Profile Update",
    steps: "1. Navigate to profile\n2. Update name\n3. Save changes",
    expected: "Profile updated successfully",
    priority: "low",
    status: "ready",
    executionStatus: "pass",
    tags: ["ui", "regression"],
    assignedTo: "Jane Smith",
    lastExecution: "5 hours ago"
  }
]

export default function TestCasesPage() {
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
              <Select>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Execution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Execution</SelectItem>
                  <SelectItem value="pass">Passed</SelectItem>
                  <SelectItem value="fail">Failed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
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
            <CardDescription>6 test cases found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Execution</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Last Execution</TableHead>
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
                        {testCase.executionStatus ? (
                          <div className="flex items-center gap-1">
                            {testCase.executionStatus === 'pass' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {testCase.executionStatus === 'fail' && <XCircle className="h-4 w-4 text-red-500" />}
                            {testCase.executionStatus === 'blocked' && <Clock className="h-4 w-4 text-yellow-500" />}
                            {testCase.executionStatus === 'skipped' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                            <span className="capitalize text-sm">{testCase.executionStatus}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {testCase.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {testCase.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">
                              {testCase.assignedTo.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-sm">{testCase.assignedTo}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {testCase.lastExecution || '-'}
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
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
