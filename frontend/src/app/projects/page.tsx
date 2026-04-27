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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { projectApi, testCaseApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { AiGenerationProgress, GenerationStep } from "@/components/ai/AiGenerationProgress"

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
  const [generateData, setGenerateData] = useState({
    module: "",
    feature_name: "",
    requirement: "",
    test_type: "functional",
    coverage_level: "medium",
    test_count: 10,
    output_columns: {
      steps: true,
      expected_result: true,
      priority: true,
      status: true,
      tags: false,
      attachments: false
    }
  })
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    { id: "analyze", label: "Analyzing requirement", status: "pending" },
    { id: "scenarios", label: "Identifying test scenarios", status: "pending" },
    { id: "generate", label: "Generating test cases", status: "pending" },
    { id: "priority", label: "Assigning priority", status: "pending" },
    { id: "finalize", label: "Finalizing output", status: "pending" }
  ])
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedTestCases, setGeneratedTestCases] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)
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
    setGenerateData({
      module: "",
      feature_name: "",
      requirement: "",
      test_type: "functional",
      coverage_level: "medium",
      test_count: 10,
      output_columns: {
        steps: true,
        expected_result: true,
        priority: true,
        status: true,
        tags: false,
        attachments: false
      }
    })
    setGenerationSteps([
      { id: "analyze", label: "Analyzing requirement", status: "pending" },
      { id: "scenarios", label: "Identifying test scenarios", status: "pending" },
      { id: "generate", label: "Generating test cases", status: "pending" },
      { id: "priority", label: "Assigning priority", status: "pending" },
      { id: "finalize", label: "Finalizing output", status: "pending" }
    ])
    setGenerationProgress(0)
    setGeneratedTestCases([])
    setShowPreview(false)
    setIsGenerateDialogOpen(true)
  }

  const handleGenerateTestCases = async () => {
    if (!generateData.requirement.trim() || !generateData.feature_name.trim() || !generatingProject) return

    setGenerating(true)
    setShowPreview(false)
    
    try {
      // Step 1: Analyze requirement
      setGenerationSteps(prev => prev.map(step => 
        step.id === "analyze" ? { ...step, status: "in_progress" } : step
      ))
      setGenerationProgress(20)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setGenerationSteps(prev => prev.map(step => 
        step.id === "analyze" ? { ...step, status: "completed" } : step
      ))

      // Step 2: Identify scenarios
      setGenerationSteps(prev => prev.map(step => 
        step.id === "scenarios" ? { ...step, status: "in_progress" } : step
      ))
      setGenerationProgress(40)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setGenerationSteps(prev => prev.map(step => 
        step.id === "scenarios" ? { ...step, status: "completed" } : step
      ))

      // Step 3: Generate test cases
      setGenerationSteps(prev => prev.map(step => 
        step.id === "generate" ? { ...step, status: "in_progress" } : step
      ))
      
      const result = await testCaseApi.generate({
        requirement: generateData.requirement,
        feature_name: generateData.feature_name,
        project_id: generatingProject.id
      })

      setGenerationProgress(70)
      if (result.data && Array.isArray(result.data)) {
        const testCases = result.data as any[]
        setGenerationSteps(prev => prev.map(step => 
          step.id === "generate" ? { ...step, status: "completed", count: testCases.length } : step
        ))
        setGeneratedTestCases(testCases)
      }

      // Step 4: Assign priority
      setGenerationSteps(prev => prev.map(step => 
        step.id === "priority" ? { ...step, status: "in_progress" } : step
      ))
      setGenerationProgress(85)
      await new Promise(resolve => setTimeout(resolve, 800))
      setGenerationSteps(prev => prev.map(step => 
        step.id === "priority" ? { ...step, status: "completed" } : step
      ))

      // Step 5: Finalize output
      setGenerationSteps(prev => prev.map(step => 
        step.id === "finalize" ? { ...step, status: "in_progress" } : step
      ))
      setGenerationProgress(100)
      await new Promise(resolve => setTimeout(resolve, 500))
      setGenerationSteps(prev => prev.map(step => 
        step.id === "finalize" ? { ...step, status: "completed" } : step
      ))

      setShowPreview(true)
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

            <Dialog open={isGenerateDialogOpen} onOpenChange={(open) => {
              if (!open) {
                setIsGenerateDialogOpen(false)
                setGeneratingProject(null)
                setShowPreview(false)
                setGenerationProgress(0)
              }
            }}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Generate Test Cases with AI</DialogTitle>
                  <DialogDescription>
                    {showPreview ? "Review and edit generated test cases before saving." : "Configure AI settings to generate test cases for this project."}
                  </DialogDescription>
                </DialogHeader>

                {!showPreview && !generating && (
                  <div className="space-y-6 py-4">
                    {/* Module and Feature */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="module">Module</Label>
                        <Select value={generateData.module} onValueChange={(value) => setGenerateData({ ...generateData, module: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select module" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="authentication">Authentication</SelectItem>
                            <SelectItem value="user_management">User Management</SelectItem>
                            <SelectItem value="payments">Payments</SelectItem>
                            <SelectItem value="reports">Reports</SelectItem>
                            <SelectItem value="api">API</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="feature-name">Feature Name</Label>
                        <Input
                          id="feature-name"
                          placeholder="e.g., User Registration"
                          value={generateData.feature_name}
                          onChange={(e) => setGenerateData({ ...generateData, feature_name: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Requirement Description */}
                    <div className="space-y-2">
                      <Label htmlFor="requirement">Requirement Description</Label>
                      <Textarea
                        id="requirement"
                        placeholder="Describe the feature requirements in detail..."
                        value={generateData.requirement}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGenerateData({ ...generateData, requirement: e.target.value })}
                        rows={4}
                      />
                    </div>

                    {/* AI Configuration */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-medium">AI Configuration</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="test-type">Test Type</Label>
                          <Select value={generateData.test_type} onValueChange={(value) => setGenerateData({ ...generateData, test_type: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="functional">Functional</SelectItem>
                              <SelectItem value="integration">Integration</SelectItem>
                              <SelectItem value="e2e">E2E</SelectItem>
                              <SelectItem value="performance">Performance</SelectItem>
                              <SelectItem value="security">Security</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="coverage-level">Coverage Level</Label>
                          <Select value={generateData.coverage_level} onValueChange={(value) => setGenerateData({ ...generateData, coverage_level: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="comprehensive">Comprehensive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="test-count">Test Count</Label>
                          <Input
                            id="test-count"
                            type="number"
                            min="1"
                            max="50"
                            value={generateData.test_count}
                            onChange={(e) => setGenerateData({ ...generateData, test_count: parseInt(e.target.value) || 10 })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Output Customization */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-medium">Output Customization</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={generateData.output_columns.steps}
                            onCheckedChange={(checked) => setGenerateData({
                              ...generateData,
                              output_columns: { ...generateData.output_columns, steps: checked as boolean }
                            })}
                          />
                          Test Steps
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={generateData.output_columns.expected_result}
                            onCheckedChange={(checked) => setGenerateData({
                              ...generateData,
                              output_columns: { ...generateData.output_columns, expected_result: checked as boolean }
                            })}
                          />
                          Expected Result
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={generateData.output_columns.priority}
                            onCheckedChange={(checked) => setGenerateData({
                              ...generateData,
                              output_columns: { ...generateData.output_columns, priority: checked as boolean }
                            })}
                          />
                          Priority
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={generateData.output_columns.status}
                            onCheckedChange={(checked) => setGenerateData({
                              ...generateData,
                              output_columns: { ...generateData.output_columns, status: checked as boolean }
                            })}
                          />
                          Status
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={generateData.output_columns.tags}
                            onCheckedChange={(checked) => setGenerateData({
                              ...generateData,
                              output_columns: { ...generateData.output_columns, tags: checked as boolean }
                            })}
                          />
                          Tags
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={generateData.output_columns.attachments}
                            onCheckedChange={(checked) => setGenerateData({
                              ...generateData,
                              output_columns: { ...generateData.output_columns, attachments: checked as boolean }
                            })}
                          />
                          Attachments
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {generating && (
                  <div className="py-4">
                    <AiGenerationProgress
                      steps={generationSteps}
                      currentProgress={generationProgress}
                    />
                  </div>
                )}

                {showPreview && (
                  <div className="space-y-4 py-4">
                    <div className="text-sm font-medium">
                      Generated {generatedTestCases.length} test cases
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium">Title</th>
                            {generateData.output_columns.steps && <th className="px-4 py-2 text-left font-medium">Steps</th>}
                            {generateData.output_columns.expected_result && <th className="px-4 py-2 text-left font-medium">Expected Result</th>}
                            {generateData.output_columns.priority && <th className="px-4 py-2 text-left font-medium">Priority</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {generatedTestCases.map((tc, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-2">{tc.title || `Test Case ${index + 1}`}</td>
                              {generateData.output_columns.steps && <td className="px-4 py-2 max-w-xs truncate">{tc.steps || "-"}</td>}
                              {generateData.output_columns.expected_result && <td className="px-4 py-2 max-w-xs truncate">{tc.expected_result || "-"}</td>}
                              {generateData.output_columns.priority && <td className="px-4 py-2">{tc.priority || "medium"}</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  {!showPreview && !generating && (
                    <>
                      <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleGenerateTestCases} disabled={!generateData.requirement.trim() || !generateData.feature_name.trim()}>
                        Generate Test Cases
                      </Button>
                    </>
                  )}
                  {showPreview && (
                    <>
                      <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                        Discard
                      </Button>
                      <Button onClick={() => {
                        setIsGenerateDialogOpen(false)
                        setGeneratingProject(null)
                        setShowPreview(false)
                        alert(`Successfully saved ${generatedTestCases.length} test cases!`)
                      }}>
                        Save to Database
                      </Button>
                    </>
                  )}
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
