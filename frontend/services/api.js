import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Projects API
export const projectsApi = {
  getProjects: async () => {
    const response = await api.get('/projects/');
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await api.post('/projects/', projectData);
    return response.data;
  },

  getProject: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },
};

// Test Cases API
export const testCasesApi = {
  getTestCases: async (projectId) => {
    const response = await api.get(`/testcases/project/${projectId}`);
    return response.data;
  },

  updateTestCase: async (testCaseId, testCaseData) => {
    const response = await api.put(`/testcases/${testCaseId}`, testCaseData);
    return response.data;
  },

  deleteTestCase: async (testCaseId) => {
    const response = await api.delete(`/testcases/${testCaseId}`);
    return response.data;
  },
};

// AI API
export const aiApi = {
  generateTestCases: async (requirement, featureName, projectId) => {
    const response = await api.post('/ai/generate-testcases', {
      requirement,
      feature_name: featureName,
      project_id: projectId,
    });
    return response.data;
  },
};

// Export API
export const exportApi = {
  exportToExcel: async (projectId) => {
    const response = await api.post('/export/excel', { project_id: projectId }, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;