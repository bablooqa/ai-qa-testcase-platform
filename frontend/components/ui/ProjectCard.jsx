import React from 'react';
import { FolderOpen, Calendar, ArrowRight } from 'lucide-react';

const ProjectCard = ({ project, onClick }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div 
      onClick={onClick}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
          <FolderOpen className="w-6 h-6 text-blue-400" />
        </div>
        <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
      </div>
      
      <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors">
        {project.name}
      </h3>
      
      <p className="text-slate-400 text-sm line-clamp-2 mb-4">
        {project.description || 'No description provided'}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-500 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(project.created_at)}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-lg">
            {project.test_cases_count || 0} tests
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;