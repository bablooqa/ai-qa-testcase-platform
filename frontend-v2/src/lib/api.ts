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
    return apiCall('/api/v1/organizations')
  },

  get: async (id: number) => {
    return apiCall(`/api/v1/organizations/${id}`)
  },

  create: async (data: { name: string; description?: string }) => {
    return apiCall('/api/v1/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: number, data: { name?: string; description?: string }) => {
    return apiCall(`/api/v1/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  inviteMember: async (id: number, data: { email: string; role: string }) => {
    return apiCall(`/api/v1/organizations/${id}/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  listMembers: async (id: number) => {
    return apiCall(`/api/v1/organizations/${id}/members`)
  },
}

// ============= PROJECT API =============

export const projectApi = {
  list: async (params?: { organization_id?: number }) => {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return apiCall(`/api/v1/projects${queryString ? `?${queryString}` : ''}`)
  },

  get: async (id: number) => {
    return apiCall(`/api/v1/projects/${id}`)
  },

  create: async (data: { name: string; description?: string; organization_id: number }) => {
    return apiCall('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: number, data: { name?: string; description?: string; status?: string }) => {
    return apiCall(`/api/v1/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: number) => {
    return apiCall(`/api/v1/projects/${id}`, {
      method: 'DELETE',
    })
  },
}

// ============= REQUIREMENT API =============

export const requirementApi = {
  list: async (params?: { project_id?: number; type?: string; priority?: string }) => {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return apiCall(`/api/v1/requirements${queryString ? `?${queryString}` : ''}`)
  },

  get: async (id: number) => {
    return apiCall(`/api/v1/requirements/${id}`)
  },

  create: async (data: {
    project_id: number
    title: string
    description?: string
    requirement_type?: string
    priority?: string
  }) => {
    return apiCall('/api/v1/requirements', {
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
    return apiCall(`/api/v1/requirements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: number) => {
    return apiCall(`/api/v1/requirements/${id}`, {
      method: 'DELETE',
    })
  },

  getTestCases: async (id: number) => {
    return apiCall(`/api/v1/requirements/${id}/test-cases`)
  },

  getStats: async (params?: { project_id?: number }) => {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return apiCall(`/api/v1/requirements/stats/overview${queryString ? `?${queryString}` : ''}`)
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
    return apiCall(`/api/v1/testcases${queryString ? `?${queryString}` : ''}`)
  },

  get: async (id: number) => {
    return apiCall(`/api/v1/testcases/${id}`)
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
    return apiCall('/api/v1/testcases', {
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
    return apiCall(`/api/v1/testcases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: number) => {
    return apiCall(`/api/v1/testcases/${id}`, {
      method: 'DELETE',
    })
  },

  clone: async (id: number) => {
    return apiCall(`/api/v1/testcases/${id}/clone`, {
      method: 'POST',
    })
  },

  getVersions: async (id: number) => {
    return apiCall(`/api/v1/testcases/${id}/versions`)
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
    return apiCall(`/api/v1/executions${queryString ? `?${queryString}` : ''}`)
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
    return apiCall('/api/v1/executions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getStats: async (params?: { project_id?: number; test_case_id?: number; days?: number }) => {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return apiCall(`/api/v1/executions/stats${queryString ? `?${queryString}` : ''}`)
  },

  getRecent: async (limit: number = 10) => {
    return apiCall(`/api/v1/executions/recent?limit=${limit}`)
  },

  getHistory: async (testCaseId: number, limit: number = 20) => {
    return apiCall(`/api/v1/executions/history/${testCaseId}?limit=${limit}`)
  },

  getDashboardSummary: async () => {
    return apiCall('/api/v1/executions/dashboard/summary')
  },

  update: async (id: number, data: {
    status?: string
    comments?: string
    environment?: string
    browser?: string
    version?: string
    attachment_url?: string
  }) => {
    return apiCall(`/api/v1/executions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

// ============= COMMENT API =============

export const commentApi = {
  create: async (data: { test_case_id: number; content: string }) => {
    return apiCall('/api/v1/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  list: async (testCaseId: number, limit: number = 50, offset: number = 0) => {
    return apiCall(`/api/v1/test-case/${testCaseId}/comments?limit=${limit}&offset=${offset}`)
  },

  getCount: async (testCaseId: number) => {
    return apiCall(`/api/v1/test-case/${testCaseId}/comments/count`)
  },

  update: async (id: number, data: { content: string }) => {
    return apiCall(`/api/v1/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: number) => {
    return apiCall(`/api/v1/comments/${id}`, {
      method: 'DELETE',
    })
  },

  mention: async (id: number, mentionedUserEmail: string) => {
    return apiCall(`/api/v1/comments/${id}/mention`, {
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
    return apiCall('/api/v1/ai/generate-testcases', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  improveTestCases: async (data: {
    project_id: number
    test_case_ids?: number[]
  }) => {
    return apiCall('/api/v1/ai/improve-testcases', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  generateAutomation: async (data: {
    test_case_id: number
    script_type: 'playwright' | 'selenium' | 'pytest' | 'cypress'
  }) => {
    return apiCall('/api/v1/ai/generate-automation', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getAutomation: async (testCaseId: number) => {
    return apiCall(`/api/v1/ai/test-case/${testCaseId}/automation`)
  },

  validateAutomation: async (testCaseId: number) => {
    return apiCall(`/api/v1/ai/test-case/${testCaseId}/automation/validate`, {
      method: 'POST',
    })
  },

  getProviders: async () => {
    return apiCall('/api/v1/ai/providers')
  },
}

// ============= EXPORT API =============

export const exportApi = {
  exportExcel: async (data: {
    project_id: number
    test_case_ids?: number[]
    format?: string
  }) => {
    return apiCall('/api/v1/export/excel', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  exportJson: async (data: {
    project_id: number
    test_case_ids?: number[]
  }) => {
    return apiCall('/api/v1/export/json', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// ============= DASHBOARD API =============

export const dashboardApi = {
  getStats: async () => {
    return apiCall('/api/v1/dashboard/stats')
  },

  getCoverage: async (projectId?: number) => {
    const queryString = projectId ? `?project_id=${projectId}` : ''
    return apiCall(`/api/v1/dashboard/coverage${queryString}`)
  },

  getActivity: async () => {
    return apiCall('/api/v1/dashboard/activity')
  },
}
