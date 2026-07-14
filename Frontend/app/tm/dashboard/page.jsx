"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, Calendar, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function TMDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projRes = await api.get('/projects');
      setProjects(projRes.data);
    } catch (err) {
      setError('Failed to load projects. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'completed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'on_hold': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">My Assigned Projects</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Select a project to view and manage tasks.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center border border-red-100">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 && !error ? (
        <div className="flex-1 bg-white rounded-3xl border border-slate-200/60 shadow-sm flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Folder className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Assigned Projects</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            You haven't been assigned to any projects yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          <AnimatePresence>
            {projects.map((proj, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={proj.id}
                onClick={() => router.push(`/tm/projects/${proj.id}`)}
                className="group bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 flex flex-col h-full relative overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                    <Folder className="w-6 h-6" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(proj.status)}`}>
                    {proj.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">
                  {proj.title}
                </h3>
                
                <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">
                  {proj.description || 'No description provided.'}
                </p>

                {/* Footer details */}
                <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center text-xs font-semibold text-slate-400">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {proj.end_date ? new Date(proj.end_date).toLocaleDateString() : 'No Deadline'}
                  </div>
                  
                  <div className="text-emerald-500 flex items-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                    View Tasks <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
