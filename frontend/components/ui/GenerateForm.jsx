import React, { useState } from 'react';
import { Sparkles, Loader2, Download } from 'lucide-react';

const GenerateForm = ({ onGenerate, loading }) => {
  const [formData, setFormData] = useState({
    feature_name: '',
    requirement: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.feature_name.trim() && formData.requirement.trim()) {
      onGenerate(formData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">AI Test Case Generator</h3>
          <p className="text-slate-400 text-sm">Generate comprehensive test cases using AI</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Feature Name
          </label>
          <input
            type="text"
            placeholder="e.g., User Authentication, Payment Processing"
            value={formData.feature_name}
            onChange={(e) => handleInputChange('feature_name', e.target.value)}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Requirement Description
          </label>
          <textarea
            placeholder="Describe the feature requirements, user stories, or acceptance criteria in detail..."
            value={formData.requirement}
            onChange={(e) => handleInputChange('requirement', e.target.value)}
            rows={6}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-slate-400 text-sm">
            <span className="text-blue-400">💡</span> Tip: Be specific about requirements for better test case quality
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setFormData({ feature_name: '', requirement: '' })}
              className="px-6 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-all duration-200 font-medium"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading || !formData.feature_name.trim() || !formData.requirement.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Test Cases</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default GenerateForm;