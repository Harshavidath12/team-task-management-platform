"use client";

import { useState, useEffect } from 'react';
import { FileText, AlertCircle, Calendar, X, CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import api from '../../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function PMReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [viewReport, setViewReport] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports');
      setReports(res.data);
    } catch (err) {
      setError('Failed to load reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto h-full flex flex-col py-8 px-4 sm:px-8">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Team Weekly Reports</h1>
        <p className="text-sm text-slate-500 font-medium mt-2">View and analyze reports submitted by the whole team.</p>
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 mb-4 border border-orange-100">
            <FileText className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Reports Yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Your team hasn't submitted any weekly reports yet. Once they do, they will appear here.
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
                    <span className="text-slate-700 font-semibold">{report.submitter_name}</span>
                    <span className="mx-2 text-slate-300">•</span>
                    {report.project_title}
                  </p>
                </div>

                <button 
                  onClick={() => setViewReport(report)}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border-2 border-blue-100 text-blue-500 font-bold text-sm hover:bg-blue-50 hover:border-blue-200 transition-colors shrink-0"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* View Report Modal */}
      {viewReport && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={() => setViewReport(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Report Details</h2>
              {getStatusBadge(viewReport.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Project</p>
                <p className="text-sm font-semibold text-slate-800">{viewReport.project_title}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Team Member</p>
                <p className="text-sm font-semibold text-slate-800">{viewReport.submitter_name}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-blue-600 flex items-center mb-3">
                  <CheckSquare className="w-4 h-4 mr-2" /> Tasks Completed
                </h3>
                <ul className="space-y-2">
                  {(typeof viewReport.tasks_completed === 'string' ? JSON.parse(viewReport.tasks_completed) : viewReport.tasks_completed)?.map((task, i) => (
                    <li key={i} className="text-sm text-slate-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                      • {task}
                    </li>
                  )) || <li className="text-sm text-slate-500 italic">No tasks completed.</li>}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-blue-600 flex items-center mb-3">
                  <Calendar className="w-4 h-4 mr-2" /> Tasks Planned for Next Week
                </h3>
                <ul className="space-y-2">
                  {(typeof viewReport.tasks_planned === 'string' ? JSON.parse(viewReport.tasks_planned) : viewReport.tasks_planned)?.map((task, i) => (
                    <li key={i} className="text-sm text-slate-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                      • {task}
                    </li>
                  )) || <li className="text-sm text-slate-500 italic">No tasks planned.</li>}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-blue-600 flex items-center mb-3">
                    <AlertTriangle className="w-4 h-4 mr-2" /> Blockers / Challenges
                  </h3>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 text-sm text-slate-700 min-h-[80px]">
                    {viewReport.blockers || <span className="text-slate-400 italic">None reported.</span>}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-600 flex items-center mb-3">
                    <Clock className="w-4 h-4 mr-2" /> Hours Worked
                  </h3>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 text-xl font-bold text-blue-700">
                    {viewReport.hours_worked} <span className="text-sm font-medium text-blue-500">hours</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
