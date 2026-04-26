"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { LayoutDashboard, FolderKanban, FileText, TrendingUp, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { projectApi, executionApi } from "@/lib/api"

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const projectsResult = await projectApi.list()
        if (Array.isArray(projectsResult.data)) {
          setProjects(projectsResult.data)
        } else {
          setProjects([])
        }

        const statsResult = await executionApi.getDashboardSummary()
        if (statsResult.data) {
          setStats(statsResult.data)
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
        setProjects([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b bg-white dark:bg-slate-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Overview of your QA activities</p>
            </div>
          </div>
          <Button>Create Project</Button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {loading ? (
          <>
            {/* Stats Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Execution Status Skeleton */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-6 w-8" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-2 w-2 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <p className="text-xs text-muted-foreground">Active projects</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Test Cases</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Total test cases</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.month_pass_rate || 0}%</div>
                  <p className="text-xs text-muted-foreground">Overall pass rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Executions Today</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.today || 0}</div>
                  <p className="text-xs text-muted-foreground">Test executions</p>
                </CardContent>
              </Card>
            </div>

            {/* Execution Status */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Execution Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Passed</span>
                    </div>
                    <Badge variant="default" className="bg-green-500">{stats?.status_breakdown?.pass || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Failed</span>
                    </div>
                    <Badge variant="destructive">{stats?.status_breakdown?.fail || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Blocked</span>
                    </div>
                    <Badge variant="secondary">{stats?.status_breakdown?.blocked || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Skipped</span>
                    </div>
                    <Badge variant="outline">{stats?.status_breakdown?.skipped || 0}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Test Cases
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Improve Test Cases
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FolderKanban className="mr-2 h-4 w-4" />
                    Create New Project
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest test executions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.recent_executions?.length > 0 ? (
                      stats.recent_executions.map((activity: any, i: number) => (
                        <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full ${
                              activity.status === 'pass' ? 'bg-green-500' :
                              activity.status === 'fail' ? 'bg-red-500' : 'bg-gray-500'
                            }`} />
                            <div>
                              <p className="text-sm font-medium">Test Case Executed</p>
                              <p className="text-xs text-muted-foreground">Test ID: {activity.test_case_id}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{activity.executed_at}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
