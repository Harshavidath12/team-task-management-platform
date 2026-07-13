"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, Calendar, ArrowRight, AlertCircle, Plus, X, CheckCircle2 } from 'lucide-react';
import api from '../../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-6 right-6 flex items-center p-4 rounded-2xl shadow-xl border z-50 min-w-[300px] ${
        type === 'error' ? 'bg-white border-red-100 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'
      }`}
    >
      {type === 'error' ? (
        <AlertCircle className="w-5 h-5 text-red-500 mr-3 shrink-0" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3 shrink-0" />
      )}
      <p className="font-medium text-sm flex-1">{message}</p>
      <button onClick={onClose} className="ml-4 text-slate-400 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default function PMDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    assigned_members: [] // Array of user IDs
  });

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/admin/users')
      ]);
      setProjects(projRes.data);
      setTeamMembers(usersRes.data.filter(u => u.role === 'team_member'));
    } catch (err) {
      setError('Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      showToast('Project created successfully!');
      setIsModalOpen(false);
      setNewProject({ title: '', description: '', start_date: '', end_date: '', assigned_members: [] });
      fetchData(); // Refresh the list
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create project', 'error');
    }
  };

  const toggleMemberSelection = (memberId) => {
    setNewProject(prev => {
      const isSelected = prev.assigned_members.includes(memberId);
      if (isSelected) {
        return { ...prev, assigned_members: prev.assigned_members.filter(id => id !== memberId) };
      } else {
        return { ...prev, assigned_members: [...prev.assigned_members, memberId] };
      }
    });
  };

  const statusConfig = {
    planning: { label: 'Planning', dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600' },
    active: { label: 'Active', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    on_hold: { label: 'On Hold', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
    completed: { label: 'Completed', dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Assigned Projects</h1>
          <p className="text-slate-500 mt-2 font-medium">Create and manage your projects and tasks.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-5 py-2.5 bg-primary hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" /> New Project
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center text-red-600 font-medium">
          <AlertCircle className="w-5 h-5 mr-3" />
          {error}
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 h-48 animate-pulse shadow-sm">
              <div className="h-10 w-10 bg-slate-100 rounded-xl mb-4"></div>
              <div className="h-5 w-3/4 bg-slate-100 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-4 border border-blue-100">
            <Folder className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Projects Assigned</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            You currently have no projects. Click the button above to create a new project and assign team members.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-5 py-2.5 bg-primary hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" /> Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj, index) => {
            const status = statusConfig[proj.status] || statusConfig.planning;
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                key={proj.id}
                className="group bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 flex flex-col h-full relative overflow-hidden"
              >
                {/* Status Badge */}
                <div className="absolute top-6 right-6">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text} border border-black/5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot} mr-1.5`}></span>
                    {status.label}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-blue-50/50 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300 border border-blue-100/50">
                  <Folder className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight group-hover:text-primary transition-colors line-clamp-1">{proj.title}</h3>
                <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed flex-1">
                  {proj.description || 'No description provided.'}
                </p>

                {/* Footer details */}
                <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center text-xs font-semibold text-slate-400">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {proj.end_date ? new Date(proj.end_date).toLocaleDateString() : 'No Deadline'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Create New Project</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6">
                <form id="createProjectForm" onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Project Title *</label>
                    <input
                      type="text"
                      required
                      value={newProject.title}
                      onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-700"
                      placeholder="e.g. Q3 Marketing Campaign"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-700 resize-none"
                      placeholder="Brief description of the project goals..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Start Date</label>
                      <input
                        type="date"
                        value={newProject.start_date}
                        onChange={(e) => setNewProject({...newProject, start_date: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">End Date</label>
                      <input
                        type="date"
                        value={newProject.end_date}
                        onChange={(e) => setNewProject({...newProject, end_date: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Team Member Selection */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Assign Team Members</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-1">
                      {teamMembers.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-2">No team members available in the system.</p>
                      ) : (
                        teamMembers.map(member => (
                          <label key={member.id} className="flex items-center p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                            <div className="relative flex items-center">
                              <input
                                type="checkbox"
                                checked={newProject.assigned_members.includes(member.id)}
                                onChange={() => toggleMemberSelection(member.id)}
                                className="peer sr-only"
                              />
                              <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-bold text-slate-700">{member.name}</p>
                              <p className="text-xs text-slate-500">{member.email}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                </form>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="createProjectForm"
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
                >
                  Create Project
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>

    </div>
  );
}
