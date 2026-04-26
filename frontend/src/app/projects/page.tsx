"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { FolderKanban, Plus, MoreHorizontal, FileText, TrendingUp, Users, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { projectApi, testCaseApi } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [generatingProject, setGeneratingProject] = useState<any>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [newProject, setNewProject] = useState({ name: "", description: "" })
  const [editProject, setEditProject] = useState({ name: "", description: "" })
  const [generateData, setGenerateData] = useState({ requirement: "", feature_name: "" })
  const router = useRouter()

  useEffect(() => {
    async function loadProjects() {
      try {
        const result = await projectApi.list()
        if (Array.isArray(result.data)) {
          setProjects(result.data)
        } else {
          setProjects([])
        }
      } catch (error) {
        console.error("Failed to load projects:", error)
        setProjects([])
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return

    setCreating(true)
    try {
      const result = await projectApi.create({
        name: newProject.name,
        description: newProject.description,
        organization_id: 1 // Default organization for MVP
      })

      if (result.data) {
        setProjects([...projects, result.data])
        setIsCreateDialogOpen(false)
        setNewProject({ name: "", description: "" })
      }
    } catch (error) {
      console.error("Failed to create project:", error)
      alert("Failed to create project. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const handleEditProject = async () => {
    if (!editProject.name.trim() || !editingProject) return

    setUpdating(true)
    try {
      const result = await projectApi.update(editingProject.id, {
        name: editProject.name,
        description: editProject.description
      })

      if (result.data) {
        setProjects(projects.map(p => p.id === editingProject.id ? result.data : p))
        setIsEditDialogOpen(false)
        setEditingProject(null)
        setEditProject({ name: "", description: "" })
      }
    } catch (error) {
      console.error("Failed to update project:", error)
      alert("Failed to update project. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    try {
      await projectApi.delete(projectId)
      setProjects(projects.filter(p => p.id !== projectId))
    } catch (error) {
      console.error("Failed to delete project:", error)
      alert("Failed to delete project. Please try again.")
    }
  }

  const openEditDialog = (project: any) => {
    setEditingProject(project)
    setEditProject({ name: project.name, description: project.description || "" })
    setIsEditDialogOpen(true)
  }

  const openGenerateDialog = (project: any) => {
    setGeneratingProject(project)
    setGenerateData({ requirement: "", feature_name: "" })
    setIsGenerateDialogOpen(true)
  }

  const handleGenerateTestCases = async () => {
    if (!generateData.requirement.trim() || !generateData.feature_name.trim() || !generatingProject) return

    setGenerating(true)
    try {
      const result = await testCaseApi.generate({
        requirement: generateData.requirement,
        feature_name: generateData.feature_name,
        project_id: generatingProject.id
      })

      if (result.data && Array.isArray(result.data)) {
        alert(`Successfully generated ${result.data.length} test cases!`)
        setIsGenerateDialogOpen(false)
        setGeneratingProject(null)
        setGenerateData({ requirement: "", feature_name: "" })
      }
    } catch (error) {
      console.error("Failed to generate test cases:", error)
      alert("Failed to generate test cases. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  const handleProjectClick = (projectId: number) => {
    router.push(`/projects/${projectId}`)
  }

  return (
    <div className="p-6">
      <header className="border-b bg-white dark:bg-slate-900 px-6 py-4 mb-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Projects</h1>
              <p className="text-sm text-muted-foreground">Manage your QA projects</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Default Organization
            </Badge>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Create a new project to organize your test cases and requirements.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter project name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter project description"
                      value={newProject.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewProject({ ...newProject, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProject} disabled={creating}>
                    {creating ? "Creating..." : "Create Project"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Project</DialogTitle>
                  <DialogDescription>
                    Update project details.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Project Name</Label>
                    <Input
                      id="edit-name"
                      placeholder="Enter project name"
                      value={editProject.name}
                      onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      placeholder="Enter project description"
                      value={editProject.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditProject({ ...editProject, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditProject} disabled={updating}>
                    {updating ? "Updating..." : "Update Project"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Test Cases</DialogTitle>
                  <DialogDescription>
                    Use AI to generate test cases for this project.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="feature-name">Feature Name</Label>
                    <Input
                      id="feature-name"
                      placeholder="e.g., User Authentication"
                      value={generateData.feature_name}
                      onChange={(e) => setGenerateData({ ...generateData, feature_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requirement">Requirement Description</Label>
                    <Textarea
                      id="requirement"
                      placeholder="Describe the feature requirements..."
                      value={generateData.requirement}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGenerateData({ ...generateData, requirement: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateTestCases} disabled={generating}>
                    {generating ? "Generating..." : "Generate Test Cases"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found. Create your first project to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleProjectClick(project.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="mt-1">{project.description || "No description"}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleProjectClick(project.id) }}>View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(project) }}>Edit Project</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openGenerateDialog(project) }}>Generate Test Cases</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); alert("Export Report - Coming soon!") }}>Export Report</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id) }} className="text-red-600">Archive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={project.status === "active" ? "default" : "secondary"}>
                    {project.status || "active"}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.created_at).toLocaleDateString()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Active</p>
                      <p className="text-xs text-muted-foreground">Status</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">0%</p>
                      <p className="text-xs text-muted-foreground">Coverage</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleProjectClick(project.id)
                    }}
                  >
                    View Test Cases
                  </Button>
                  <Button 
                    className="flex-1" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openGenerateDialog(project)
                    }}
                  >
                    Generate AI
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
