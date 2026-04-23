import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { testCasesApi, aiApi, exportApi } from '../../services/api';

const ProjectDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [project, setProject] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState({ priority: '', status: '' });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [formData, setFormData] = useState({ feature_name: '', requirement: '' });

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const testCasesData = await testCasesApi.getTestCases(id);
      setTestCases(testCasesData);
      setProject({ name: 'Project', description: 'Project description' });
    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTestCases = async () => {
    if (!formData.feature_name.trim() || !formData.requirement.trim()) return;
    
    setGenerating(true);
    try {
      const newTestCases = await aiApi.generateTestCases(
        formData.requirement,
        formData.feature_name,
        parseInt(id)
      );
      setTestCases([...testCases, ...newTestCases]);
      setFormData({ feature_name: '', requirement: '' });
    } catch (error) {
      console.error('Error generating test cases:', error);
      alert('Failed to generate test cases. Please check your API keys and try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await exportApi.exportToExcel(parseInt(id));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test_cases_${project.name.replace(' ', '_')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel');
    }
  };

  const handleUpdateTestCase = async (testCaseId, updates) => {
    try {
      const updatedCase = await testCasesApi.updateTestCase(testCaseId, updates);
      setTestCases(testCases.map(tc => tc.id === testCaseId ? updatedCase : tc));
    } catch (error) {
      console.error('Error updating test case:', error);
    }
  };

  const handleDeleteTestCase = async (testCaseId) => {
    if (!confirm('Are you sure you want to delete this test case?')) return;
    
    try {
      await testCasesApi.deleteTestCase(testCaseId);
      setTestCases(testCases.filter(tc => tc.id !== testCaseId));
    } catch (error) {
      console.error('Error deleting test case:', error);
    }
  };

  const filteredTestCases = testCases.filter(tc => {
    if (filter.priority && tc.priority !== filter.priority) return false;
    if (filter.status && tc.status !== filter.status) return false;
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'rgba(239, 68, 68, 0.2)' };
      case 'high': return { bg: 'rgba(249, 115, 22, 0.1)', color: '#fb923c', border: 'rgba(249, 115, 22, 0.2)' };
      case 'medium': return { bg: 'rgba(234, 179, 8, 0.1)', color: '#facc15', border: 'rgba(234, 179, 8, 0.2)' };
      case 'low': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.2)' };
      default: return { bg: 'rgba(100, 116, 139, 0.1)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.2)' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.2)' };
      case 'ready': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.2)' };
      case 'draft': return { bg: 'rgba(234, 179, 8, 0.1)', color: '#facc15', border: 'rgba(234, 179, 8, 0.2)' };
      case 'deprecated': return { bg: 'rgba(100, 116, 139, 0.1)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.2)' };
      default: return { bg: 'rgba(100, 116, 139, 0.1)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.2)' };
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #3b82f6', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '16px', color: '#94a3b8' }}>Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Modern Header */}
      <header style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => router.push('/')}
              style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{project?.name}</h1>
              <p style={{ color: '#94a3b8' }}>{project?.description || 'No description provided'}</p>
            </div>
          </div>
          
          <button
            onClick={handleExportExcel}
            disabled={testCases.length === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: testCases.length === 0 ? 'not-allowed' : 'pointer',
              opacity: testCases.length === 0 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '24px' }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(8px)', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Total Test Cases</p>
                <p style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>{testCases.length}</p>
              </div>
              <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '24px', height: '24px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
              </div>
            </div>
          </div>
          
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(8px)', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Critical</p>
                <p style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                  {testCases.filter(tc => tc.priority === 'critical').length}
                </p>
              </div>
              <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '24px', height: '24px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
              </div>
            </div>
          </div>
          
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(8px)', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Ready</p>
                <p style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                  {testCases.filter(tc => tc.status === 'ready').length}
                </p>
              </div>
              <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '24px', height: '24px', backgroundColor: '#22c55e', borderRadius: '50%' }}></div>
              </div>
            </div>
          </div>
          
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(8px)', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Approved</p>
                <p style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                  {testCases.filter(tc => tc.status === 'approved').length}
                </p>
              </div>
              <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(168, 85, 247, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '24px', height: '24px', backgroundColor: '#a855f7', borderRadius: '50%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Generator Form */}
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(8px)', border: '1px solid #334155', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 style={{ color: 'white', fontWeight: '600', fontSize: '18px', marginBottom: '4px' }}>AI Test Case Generator</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>Generate comprehensive test cases using AI</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Feature Name
              </label>
              <input
                type="text"
                placeholder="e.g., User Authentication, Payment Processing"
                value={formData.feature_name}
                onChange={(e) => setFormData({ ...formData, feature_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid #475569',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Requirement Description
              </label>
              <textarea
                placeholder="Describe the feature requirements, user stories, or acceptance criteria in detail..."
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid #475569',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                <span style={{ color: '#3b82f6' }}>💡</span> Tip: Be specific about requirements for better test case quality
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setFormData({ feature_name: '', requirement: '' })}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#1e293b',
                    color: '#cbd5e1',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={handleGenerateTestCases}
                  disabled={generating || !formData.feature_name.trim() || !formData.requirement.trim()}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: (generating || !formData.feature_name.trim() || !formData.requirement.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (generating || !formData.feature_name.trim() || !formData.requirement.trim()) ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.25)'
                  }}
                >
                  {generating ? (
                    <>
                      <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Generate Test Cases</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Test Cases Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>Test Cases</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Filter Button */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1e293b',
                    color: '#cbd5e1',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>Filter</span>
                </button>
                
                {showFilterMenu && (
                  <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '8px', width: '192px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', zIndex: 50 }}>
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Priority</label>
                        <select
                          value={filter.priority}
                          onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            backgroundColor: '#334155',
                            border: '1px solid #475569',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '14px'
                          }}
                        >
                          <option value="">All Priorities</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Status</label>
                        <select
                          value={filter.status}
                          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            backgroundColor: '#334155',
                            border: '1px solid #475569',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '14px'
                          }}
                        >
                          <option value="">All Status</option>
                          <option value="draft">Draft</option>
                          <option value="ready">Ready</option>
                          <option value="approved">Approved</option>
                          <option value="deprecated">Deprecated</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Test Cases Table */}
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(8px)', border: '1px solid #334155', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', borderBottom: '1px solid #334155' }}>
                  <tr>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#94a3b8', textTransform: 'uppercase' }}>ID</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#94a3b8', textTransform: 'uppercase' }}>Title</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#94a3b8', textTransform: 'uppercase' }}>Steps</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#94a3b8', textTransform: 'uppercase' }}>Expected Result</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#94a3b8', textTransform: 'uppercase' }}>Priority</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#94a3b8', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#94a3b8', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ borderBottom: '1px solid #334155' }}>
                  {filteredTestCases.map((testCase) => (
                    <tr key={testCase.id} style={{ borderBottom: '1px solid #334155', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px', color: '#cbd5e1', fontSize: '14px', whiteSpace: 'nowrap' }}>
                        TC-{testCase.id.toString().padStart(4, '0')}
                      </td>
                      <td style={{ padding: '16px', color: '#cbd5e1', fontSize: '14px' }}>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{testCase.title}</div>
                      </td>
                      <td style={{ padding: '16px', color: '#cbd5e1', fontSize: '14px' }}>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{testCase.steps}</div>
                      </td>
                      <td style={{ padding: '16px', color: '#cbd5e1', fontSize: '14px' }}>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{testCase.expected_result}</div>
                      </td>
                      <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          fontSize: '12px', 
                          fontWeight: '500', 
                          borderRadius: '9999px',
                          backgroundColor: getPriorityColor(testCase.priority).bg,
                          color: getPriorityColor(testCase.priority).color,
                          border: `1px solid ${getPriorityColor(testCase.priority).border}`
                        }}>
                          {testCase.priority}
                        </span>
                      </td>
                      <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          fontSize: '12px', 
                          fontWeight: '500', 
                          borderRadius: '9999px',
                          backgroundColor: getStatusColor(testCase.status).bg,
                          color: getStatusColor(testCase.status).color,
                          border: `1px solid ${getStatusColor(testCase.status).border}`
                        }}>
                          {testCase.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleDeleteTestCase(testCase.id)}
                            style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#f87171' }}
                          >
                            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredTestCases.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <div style={{ color: '#64748b' }}>
                  <div style={{ width: '64px', height: '64px', backgroundColor: '#334155', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>No test cases yet</h3>
                  <p style={{ color: '#64748b' }}>Generate your first test cases to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProjectDetail;