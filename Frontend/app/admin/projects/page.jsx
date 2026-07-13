"use client";

import { useState, useEffect } from 'react';
import { Folder, Trash2, AlertCircle, X, ChevronDown, CheckCircle2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../utils/api';

// --- Toast Component ---
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

export default function AdminProjectDelegation() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/admin/users')
      ]);
      setProjects(projRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      showToast('Failed to load data. Please refresh.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManagerChange = async (projectId, newManagerId) => {
    try {
      if (!newManagerId) return; // If selecting placeholder
      await api.put(`/projects/${projectId}/manager`, { manager_id: newManagerId });
      showToast('Project manager reassigned successfully');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reassign manager', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      showToast('Project permanently deleted');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete project', 'error');
    }
  };

  const statusConfig = {
    planning: { label: 'Planning', dot: 'bg-slate-400' },
    active: { label: 'Active', dot: 'bg-emerald-400' },
    on_hold: { label: 'On Hold', dot: 'bg-amber-400' },
    completed: { label: 'Completed', dot: 'bg-blue-400' },
  };

  const projectManagers = users.filter(u => u.role === 'project_manager');

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Active Projects</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Oversee projects and delegate Project Managers</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-700"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 rounded-tl-3xl">Project Details</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">Project Manager</th>
                <th scope="col" className="px-6 py-4 rounded-tr-3xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="px-6 py-4"><div className="h-10 w-48 bg-slate-100 rounded-lg animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-100 rounded-lg animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" /></td>
                    </tr>
                  ))}
                </>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 mb-3 border border-slate-100">
                      <Folder className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No projects found.</p>
                    <p className="text-slate-400 text-xs mt-1">Project Managers have not created any projects yet.</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((proj) => (
                  <motion.tr 
                    key={proj.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0 border border-blue-100/50">
                          <Folder className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-800 tracking-tight leading-none mb-1.5">{proj.title}</div>
                          <div className="text-xs text-slate-500 max-w-xs truncate">{proj.description || 'No description'}</div>
                          <div className="text-[11px] text-slate-400 mt-1 font-medium">
                            {proj.start_date ? new Date(proj.start_date).toLocaleDateString() : 'TBD'} - {proj.end_date ? new Date(proj.end_date).toLocaleDateString() : 'TBD'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig[proj.status]?.dot || 'bg-slate-300'}`}></span>
                        </span>
                        <span className="text-xs font-semibold text-slate-700">{statusConfig[proj.status]?.label || proj.status}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="relative group w-48">
                        <select
                          value={proj.manager_id || ''}
                          onChange={(e) => handleManagerChange(proj.id, e.target.value)}
                          className="w-full appearance-none px-3 py-2 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 hover:border-slate-300"
                        >
                          <option value="" disabled>Unassigned</option>
                          {projectManagers.map(pm => (
                            <option key={pm.id} value={pm.id}>{pm.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40 pointer-events-none group-hover:opacity-60 transition-opacity" />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(proj.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group-hover:opacity-100 opacity-60"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
      
    </div>
  );
}
