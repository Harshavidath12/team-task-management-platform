"use client";

import { useState, useEffect } from 'react';
import { FileText, AlertCircle, Calendar, Plus, X, CheckCircle2, Save, CheckSquare, Clock, AlertTriangle, Folder } from 'lucide-react';
import api from '../../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function TMReports() {
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewReport, setViewReport] = useState(null);

  // New Report State
  const [editingReportId, setEditingReportId] = useState(null);
  const [projectId, setProjectId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tasksCompleted, setTasksCompleted] = useState(['']);
  const [tasksPlanned, setTasksPlanned] = useState(['']);
  const [blockers, setBlockers] = useState('');
  const [hoursWorked, setHoursWorked] = useState('');

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

  const handleArrayChange = (setter, array, index, value) => {
    const newArray = [...array];
    newArray[index] = value;
    setter(newArray);
  };

  const addArrayItem = (setter, array) => {
    setter([...array, '']);
  };

  const removeArrayItem = (setter, array, index) => {
    const newArray = array.filter((_, i) => i !== index);
    setter(newArray.length ? newArray : ['']);
  };

  const handleCreateReport = async (e, status) => {
    e.preventDefault();
    if (!projectId) {
      alert('Please select a project');
      return;
    }
    if (!hoursWorked) {
      alert('Hours worked is a required field');
      return;
    }

    const payload = {
      project_id: projectId,
      date_range: `${startDate} - ${endDate}`,
      status,
      tasks_completed: tasksCompleted.filter(t => t.trim() !== ''),
      tasks_planned: tasksPlanned.filter(t => t.trim() !== ''),
      blockers,
      hours_worked: hoursWorked
    };
    
    try {
      if (editingReportId) {
        await api.put(`/reports/${editingReportId}`, payload);
      } else {
        await api.post('/reports', payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save report');
    }
  };

  const handleEditDraft = (report) => {
    setViewReport(null);
    setEditingReportId(report.id);
    setProjectId(report.project_id);
    
    const dates = report.date_range.split(' - ');
    if (dates.length === 2) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);
    }
    
    const tCompleted = typeof report.tasks_completed === 'string' ? JSON.parse(report.tasks_completed) : report.tasks_completed;
    setTasksCompleted(tCompleted && tCompleted.length > 0 ? tCompleted : ['']);
    
    const tPlanned = typeof report.tasks_planned === 'string' ? JSON.parse(report.tasks_planned) : report.tasks_planned;
    setTasksPlanned(tPlanned && tPlanned.length > 0 ? tPlanned : ['']);
    
    setBlockers(report.blockers || '');
    setHoursWorked(report.hours_worked || '');
    
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setProjectId('');
    setStartDate('');
    setEndDate('');
    setTasksCompleted(['']);
    setTasksPlanned(['']);
    setBlockers('');
    setHoursWorked('');
    setEditingReportId(null);
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
          onClick={() => { resetForm(); setIsModalOpen(true); }}
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
                  onClick={() => setViewReport(report)}
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

      {/* View Report Modal */}
      {viewReport && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="shrink-0 px-8 pt-8 pb-6 bg-white relative z-10 border-b border-slate-50">
              <button 
                onClick={() => setViewReport(null)}
                className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between pr-12">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Report Details</h2>
                  {getStatusBadge(viewReport.status)}
                </div>
                {viewReport.status === 'Draft' && (
                  <button
                    onClick={() => handleEditDraft(viewReport)}
                    className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors"
                  >
                    Edit Draft
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto px-8 py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Project</p>
                <p className="text-sm font-semibold text-slate-800">{viewReport.project_title}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date Range</p>
                <p className="text-sm font-semibold text-slate-800">{viewReport.date_range}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-emerald-600 flex items-center mb-3">
                  <CheckSquare className="w-4 h-4 mr-2" /> Tasks Completed
                </h3>
                <ul className="space-y-2">
                  {(typeof viewReport.tasks_completed === 'string' ? JSON.parse(viewReport.tasks_completed) : viewReport.tasks_completed)?.map((task, i) => (
                    <li key={i} className="text-sm text-slate-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                      • {task}
                    </li>
                  )) || <li className="text-sm text-slate-500 italic">No tasks completed.</li>}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-emerald-600 flex items-center mb-3">
                  <Calendar className="w-4 h-4 mr-2" /> Tasks Planned for Next Week
                </h3>
                <ul className="space-y-2">
                  {(typeof viewReport.tasks_planned === 'string' ? JSON.parse(viewReport.tasks_planned) : viewReport.tasks_planned)?.map((task, i) => (
                    <li key={i} className="text-sm text-slate-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                      • {task}
                    </li>
                  )) || <li className="text-sm text-slate-500 italic">No tasks planned.</li>}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-emerald-600 flex items-center mb-3">
                    <AlertTriangle className="w-4 h-4 mr-2" /> Blockers / Challenges
                  </h3>
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 text-sm text-slate-700 min-h-[80px]">
                    {viewReport.blockers || <span className="text-slate-400 italic">None reported.</span>}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-600 flex items-center mb-3">
                    <Clock className="w-4 h-4 mr-2" /> Hours Worked
                  </h3>
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 text-xl font-bold text-emerald-700">
                    {viewReport.hours_worked} <span className="text-sm font-medium text-emerald-500">hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </motion.div>
        </div>
      )}

      {/* New Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-50 rounded-3xl w-full max-w-3xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="shrink-0 px-8 pt-8 pb-6 bg-slate-50 relative z-10 border-b border-slate-200/50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pr-12">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-orange-500" /> Draft New Report
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-2">Fill out the details below to log your progress.</p>
              </div>
            </div>
            
            <div className="overflow-y-auto px-8 py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <form className="space-y-6">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="flex items-center text-sm font-bold text-slate-800 mb-6">
                  <Folder className="w-4 h-4 mr-2 text-orange-500" /> General Details
                </h3>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="flex items-center text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" /> Week Start Date
                    </label>
                    <input
                      required
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="flex items-center text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" /> Week End Date
                    </label>
                    <input
                      required
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                    <Folder className="w-3.5 h-3.5 mr-1.5" /> Project or Category Tag
                  </label>
                  <select
                    required
                    value={projectId}
                    onChange={e => setProjectId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
                  >
                    <option value="">Select a project...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tasks Completed */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <label className="flex items-center text-sm font-bold text-slate-700 mb-3">
                  <CheckSquare className="w-4 h-4 mr-2 text-emerald-500" /> Tasks Completed
                </label>
                <div className="space-y-2">
                  {tasksCompleted.map((task, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={task}
                        onChange={(e) => handleArrayChange(setTasksCompleted, tasksCompleted, index, e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-sm"
                        placeholder="What did you finish?"
                      />
                      {tasksCompleted.length > 1 && (
                        <button type="button" onClick={() => removeArrayItem(setTasksCompleted, tasksCompleted, index)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem(setTasksCompleted, tasksCompleted)}
                  className="mt-3 flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add another task
                </button>
              </div>

              {/* Tasks Planned */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <label className="flex items-center text-sm font-bold text-slate-700 mb-3">
                  <Calendar className="w-4 h-4 mr-2 text-emerald-500" /> Tasks Planned for Next Week
                </label>
                <div className="space-y-2">
                  {tasksPlanned.map((task, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={task}
                        onChange={(e) => handleArrayChange(setTasksPlanned, tasksPlanned, index, e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-sm"
                        placeholder="What's next?"
                      />
                      {tasksPlanned.length > 1 && (
                        <button type="button" onClick={() => removeArrayItem(setTasksPlanned, tasksPlanned, index)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem(setTasksPlanned, tasksPlanned)}
                  className="mt-3 flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add another task
                </button>
              </div>

              {/* Additional Details */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <label className="flex items-center text-sm font-bold text-slate-700 mb-4">
                  <AlertCircle className="w-4 h-4 mr-2 text-emerald-500" /> Additional Details
                </label>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Blockers / Challenges (Optional)</label>
                    <textarea
                      value={blockers}
                      onChange={e => setBlockers(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium min-h-[80px] text-sm"
                      placeholder="Any issues preventing progress?"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Hours Worked *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.5"
                      value={hoursWorked}
                      onChange={e => setHoursWorked(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-sm max-w-[200px]"
                      placeholder="e.g. 40"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
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
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
