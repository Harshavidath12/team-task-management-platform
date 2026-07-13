"use client";

import { useState, useEffect } from 'react';
import { FileText, AlertCircle, Calendar } from 'lucide-react';
import api from '../../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function PMReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
                  onClick={() => alert(`Viewing report: ${report.id} \n\n${report.content}`)}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border-2 border-orange-100 text-orange-500 font-bold text-sm hover:bg-orange-50 hover:border-orange-200 transition-colors shrink-0"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
