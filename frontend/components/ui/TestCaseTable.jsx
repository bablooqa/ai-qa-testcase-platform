import React, { useState } from 'react';
import { Edit2, Trash2, Save, X, ChevronDown } from 'lucide-react';

const TestCaseTable = ({ 
  testCases, 
  onEdit, 
  onDelete, 
  onUpdate, 
  loading = false 
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (testCase) => {
    setEditingId(testCase.id);
    setEditForm({
      title: testCase.title,
      steps: testCase.steps,
      expected_result: testCase.expected_result,
      priority: testCase.priority,
      status: testCase.status
    });
  };

  const handleSave = async (id) => {
    await onUpdate(id, editForm);
    setEditingId(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'ready': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'draft': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'deprecated': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Steps
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Expected Result
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {testCases.map((testCase) => (
              <tr key={testCase.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  TC-{testCase.id.toString().padStart(4, '0')}
                </td>
                
                <td className="px-6 py-4 text-sm">
                  {editingId === testCase.id ? (
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-slate-300 max-w-xs truncate">{testCase.title}</div>
                  )}
                </td>
                
                <td className="px-6 py-4 text-sm">
                  {editingId === testCase.id ? (
                    <textarea
                      value={editForm.steps}
                      onChange={(e) => setEditForm({ ...editForm, steps: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  ) : (
                    <div className="text-slate-300 max-w-xs truncate">{testCase.steps}</div>
                  )}
                </td>
                
                <td className="px-6 py-4 text-sm">
                  {editingId === testCase.id ? (
                    <textarea
                      value={editForm.expected_result}
                      onChange={(e) => setEditForm({ ...editForm, expected_result: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  ) : (
                    <div className="text-slate-300 max-w-xs truncate">{testCase.expected_result}</div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {editingId === testCase.id ? (
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(testCase.priority)}`}>
                      {testCase.priority}
                    </span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {editingId === testCase.id ? (
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="ready">Ready</option>
                      <option value="approved">Approved</option>
                      <option value="deprecated">Deprecated</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(testCase.status)}`}>
                      {testCase.status}
                    </span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {editingId === testCase.id ? (
                      <>
                        <button
                          onClick={() => handleSave(testCase.id)}
                          className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 text-slate-400 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(testCase)}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(testCase.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {testCases.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-500">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">No test cases yet</h3>
            <p className="text-slate-500">Generate your first test cases to get started</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCaseTable;