"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { FolderKanban, Plus, MoreHorizontal, FileText, TrendingUp, Users, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const projects = [
  {
    id: 1,
    name: "E-Commerce Platform",
    description: "Main shopping platform with checkout flow",
    organization: "Acme Corp",
    testCases: 45,
    requirements: 12,
    lastUpdated: "2 hours ago",
    status: "active",
    coverage: 78
  },
  {
    id: 2,
    name: "Mobile App API",
    description: "REST API for mobile application",
    organization: "Acme Corp",
    testCases: 32,
    requirements: 8,
    lastUpdated: "1 day ago",
    status: "active",
    coverage: 92
  },
  {
    id: 3,
    name: "User Authentication",
    description: "SSO and authentication system",
    organization: "Acme Corp",
    testCases: 28,
    requirements: 6,
    lastUpdated: "3 days ago",
    status: "active",
    coverage: 85
  },
  {
    id: 4,
    name: "Payment Gateway",
    description: "Payment processing integration",
    organization: "Acme Corp",
    testCases: 56,
    requirements: 15,
    lastUpdated: "5 days ago",
    status: "active",
    coverage: 67
  },
  {
    id: 5,
    name: "Admin Dashboard",
    description: "Administrative interface",
    organization: "Acme Corp",
    testCases: 23,
    requirements: 5,
    lastUpdated: "1 week ago",
    status: "archived",
    coverage: 71
  },
  {
    id: 6,
    name: "Reporting System",
    description: "Analytics and reporting module",
    organization: "Acme Corp",
    testCases: 18,
    requirements: 4,
    lastUpdated: "2 weeks ago",
    status: "active",
    coverage: 54
  }
]

export default function ProjectsPage() {
  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b bg-white dark:bg-slate-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold">Projects</h1>
              <p className="text-sm text-muted-foreground">Manage your QA projects</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Acme Corp
            </Badge>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="mt-1">{project.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Project</DropdownMenuItem>
                      <DropdownMenuItem>Generate Test Cases</DropdownMenuItem>
                      <DropdownMenuItem>Export Report</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Archive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={project.status === "active" ? "default" : "secondary"}>
                    {project.status}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {project.lastUpdated}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{project.testCases}</p>
                      <p className="text-xs text-muted-foreground">Test Cases</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{project.coverage}%</p>
                      <p className="text-xs text-muted-foreground">Coverage</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Test Coverage</span>
                    <span className="font-medium">{project.coverage}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        project.coverage >= 80 ? "bg-green-500" :
                        project.coverage >= 60 ? "bg-blue-500" :
                        project.coverage >= 40 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${project.coverage}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" size="sm">
                    View Test Cases
                  </Button>
                  <Button className="flex-1" size="sm">
                    Generate AI
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
