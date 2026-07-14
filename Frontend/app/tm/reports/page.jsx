"use client";

import { useState, useEffect } from 'react';
import { FileText, AlertCircle, Calendar, Plus, X, CheckCircle2, Save } from 'lucide-react';
import api from '../../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function TMReports() {
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReport, setNewReport] = useState({ project_id: '', date_range: '', content: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, projectsRes] = await Promise.all([
        api.get('/reports'),
        api.get('/projects') // TMs only get assigned projects thanks to backend
      ]);
      setReports(reportsRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateReport = async (e, status) => {
    e.preventDefault();
    if (!newReport.project_id) {
      alert('Please select a project');
      return;
    }
    
    try {
      await api.post('/reports', { ...newReport, status });
      setIsModalOpen(false);
      setNewReport({ project_id: '', date_range: '', content: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save report');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Submitted') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
          Submitted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">
        Draft
      </span>
    );
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">My Weekly Reports</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Submit your progress reports to project managers.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-sm"
        >
          <Plus className="w-5 h-5 mr-1.5" />
          New Report
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center border border-red-100">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Reports List */}
      {reports.length === 0 && !error ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200/60 shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 mb-4 border border-emerald-100">
            <FileText className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Reports Yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            You haven't submitted any weekly reports yet. Click 'New Report' to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto pb-10">
          <AnimatePresence>
            {reports.map((report, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={report.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-bold text-slate-800 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      {report.date_range}
                    </h3>
                    {getStatusBadge(report.status)}
                  </div>
                  <p className="text-sm font-medium text-slate-500 flex items-center">
                    <span className="text-slate-700 font-semibold">You</span>
                    <span className="mx-2 text-slate-300">•</span>
                    {report.project_title}
                  </p>
                </div>

                <button 
                  onClick={() => alert(`Viewing report: ${report.id} \n\n${report.content}`)}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border-2 border-emerald-100 text-emerald-600 font-bold text-sm hover:bg-emerald-50 hover:border-emerald-200 transition-colors shrink-0"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* New Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-slate-800 mb-6 tracking-tight">Create New Report</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Project *</label>
                <select
                  required
                  value={newReport.project_id}
                  onChange={e => setNewReport({...newReport, project_id: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
                >
                  <option value="">Select a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Date Range *</label>
                <input
                  required
                  type="text"
                  value={newReport.date_range}
                  onChange={e => setNewReport({...newReport, date_range: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  placeholder="E.g., Jul 2, 2026 - Jul 10, 2026"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Content</label>
                <textarea
                  value={newReport.content}
                  onChange={e => setNewReport({...newReport, content: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium min-h-[150px]"
                  placeholder="What did you accomplish this week?"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={(e) => handleCreateReport(e, 'Draft')}
                  className="flex-1 py-3.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl font-bold text-sm transition-all flex items-center justify-center border border-amber-200"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={(e) => handleCreateReport(e, 'Submitted')}
                  className="flex-1 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Report
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
