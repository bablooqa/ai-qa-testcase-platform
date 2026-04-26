/**
 * API Service for AI QA Platform
 * Connects frontend to backend FastAPI endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      return { error: error.detail || 'API request failed' }
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' }
  }
}

// ============= ORGANIZATION API =============

export const organizationApi = {
  list: async () => {
    return apiCall('/organizations')
  },

  get: async (id: number) => {
    return apiCall(`/organizations/${id}`)
  },

  create: async (data: { name: string; description?: string }) => {
    return apiCall('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: number, data: { name?: string; description?: string }) => {
    return apiCall(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  inviteMember: async (id: number, data: { email: string; role: string }) => {
    return apiCall(`/organizations/${id}/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  listMembers: async (id: number) => {
    return apiCall(`/organizations/${id}/members`)
  },
}

// ============= PROJECT API =============

export const projectApi = {
  list: async (params?: { organization_id?: number }) => {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return apiCall(`/projects${queryString ? `?${queryString}` : ''}`)
  },

  get: async (id: number) => {
    return apiCall(`/projects/${id}`)
  },

  create: async (data: { name: string; description?: string; organization_id: number }) => {
    return apiCall('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: number, data: { name?: string; description?: string; status?: string }) => {
    return apiCall(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: number) => {
    return apiCall(`/projects/${id}`, {
      method: 'DELETE',
    })
  },
}

// ============= REQUIREMENT API =============

export const requirementApi = {
  list: async (params?: { project_id?: number; type?: string; priority?: string }) => {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return apiCall(`/requirements${queryString ? `?${queryString}` : ''}`)
  },

  get: async (id: number) => {
    return apiCall(`/requirements/${id}`)
  },

  create: async (data: {
    project_id: number
    title: string
    description?: string
    requirement_type?: string
    priority?: string
  }) => {
    return apiCall('/requirements', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: number, data: {
    title?: string
    description?: string
    requirement_type?: string
    priority?: string
    status?: string
  }) => {
    return apiCall(`/requirements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: number) => {
    return apiCall(`/requirements/${id}`, {
      method: 'DELETE',
    })
  },

  getTestCases: async (id: number) => {
    return apiCall(`/requirements/${id}/test-cases`)
  },

  getStats: async (params?: { project_id?: number }) => {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return apiCall(`/requirements/stats/overview${queryString ? `?${queryString}` : ''}`)
  },
}

// ============= TEST CASE API =============

export const testCaseApi = {
  list: async (params?: {
    project_id?: number
    requirement_id?: number
    status?: string
    priority?: string
    assigned_to?: number
    tags?: string[]
    search?: string
  }) => {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return apiCall(`/testcases${queryString ? `?${queryString}` : ''}`)
  },

  get: async (id: number) => {
    return apiCall(`/testcases/${id}`)
  },

  create: async (data: {
    project_id: number
    title: string
    description?: string
    steps: string
    expected_result: string
    priority?: string
    severity?: string
    status?: string
    tags?: string[]
    requirement_id?: number
    assigned_to?: number
  }) => {
    return apiCall('/testcases', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: number, data: {
    title?: string
    description?: string
    steps?: string
    expected_result?: string
    priority?: string
    severity?: string
    status?: string
    tags?: string[]
    assigned_to?: number
  }) => {
    return apiCall(`/testcases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: number) => {
    return apiCall(`/testcases/${id}`, {
      method: 'DELETE',
    })
  },

  clone: async (id: number) => {
    return apiCall(`/testcases/${id}/clone`, {
      method: 'POST',
    })
  },

  getVersions: async (id: number) => {
    return apiCall(`/testcases/${id}/versions`)
  },
}

// ============= TEST EXECUTION API =============

export const executionApi = {
  list: async (params?: {
    test_case_id?: number
    project_id?: number
    status?: string
    executed_by?: number
    limit?: number
    offset?: number
  }) => {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return apiCall(`/executions${queryString ? `?${queryString}` : ''}`)
  },

  create: async (data: {
    test_case_id: number
    status: string
    comments?: string
    environment?: string
    browser?: string
    version?: string
    attachment_url?: string
  }) => {
    return apiCall('/executions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getStats: async (params?: { project_id?: number; test_case_id?: number; days?: number }) => {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return apiCall(`/executions/stats${queryString ? `?${queryString}` : ''}`)
  },

  getRecent: async (limit: number = 10) => {
    return apiCall(`/executions/recent?limit=${limit}`)
  },

  getHistory: async (testCaseId: number, limit: number = 20) => {
    return apiCall(`/executions/history/${testCaseId}?limit=${limit}`)
  },

  getDashboardSummary: async () => {
    return apiCall('/executions/dashboard/summary')
  },

  update: async (id: number, data: {
    status?: string
    comments?: string
    environment?: string
    browser?: string
    version?: string
    attachment_url?: string
  }) => {
    return apiCall(`/executions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

// ============= COMMENT API =============

export const commentApi = {
  create: async (data: { test_case_id: number; content: string }) => {
    return apiCall('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  list: async (testCaseId: number, limit: number = 50, offset: number = 0) => {
    return apiCall(`/test-case/${testCaseId}/comments?limit=${limit}&offset=${offset}`)
  },

  getCount: async (testCaseId: number) => {
    return apiCall(`/test-case/${testCaseId}/comments/count`)
  },

  update: async (id: number, data: { content: string }) => {
    return apiCall(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: number) => {
    return apiCall(`/comments/${id}`, {
      method: 'DELETE',
    })
  },

  mention: async (id: number, mentionedUserEmail: string) => {
    return apiCall(`/comments/${id}/mention`, {
      method: 'POST',
      body: JSON.stringify({ mentioned_user_email: mentionedUserEmail }),
    })
  },
}

// ============= AI API =============

export const aiApi = {
  generateTestCases: async (data: {
    project_id: number
    requirement_id?: number
    feature_name: string
    requirement_description: string
    additional_context?: string
  }) => {
    return apiCall('/ai/generate-testcases', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  improveTestCases: async (data: {
    project_id: number
    test_case_ids?: number[]
  }) => {
    return apiCall('/ai/improve-testcases', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  generateAutomation: async (data: {
    test_case_id: number
    script_type: 'playwright' | 'selenium' | 'pytest' | 'cypress'
  }) => {
    return apiCall('/ai/generate-automation', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getAutomation: async (testCaseId: number) => {
    return apiCall(`/ai/test-case/${testCaseId}/automation`)
  },

  validateAutomation: async (testCaseId: number) => {
    return apiCall(`/ai/test-case/${testCaseId}/automation/validate`, {
      method: 'POST',
    })
  },

  getProviders: async () => {
    return apiCall('/ai/providers')
  },
}

// ============= EXPORT API =============

export const exportApi = {
  exportExcel: async (data: {
    project_id: number
    test_case_ids?: number[]
    format?: string
  }) => {
    return apiCall('/export/excel', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  exportJson: async (data: {
    project_id: number
    test_case_ids?: number[]
  }) => {
    return apiCall('/export/json', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// ============= DASHBOARD API =============

export const dashboardApi = {
  getStats: async () => {
    return apiCall('/dashboard/stats')
  },

  getCoverage: async (projectId?: number) => {
    const queryString = projectId ? `?project_id=${projectId}` : ''
    return apiCall(`/dashboard/coverage${queryString}`)
  },

  getActivity: async () => {
    return apiCall('/dashboard/activity')
  },
}
