"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Plus, Clock, AlertCircle, X, CheckCircle2, 
  Calendar, User as UserIcon, MoreVertical, Trash2 
} from 'lucide-react';
import api from '../../../../utils/api';
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

export default function PMProjectDetails() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id;

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: ''
  });

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all projects to find this specific one, tasks, and users
      const [projRes, taskRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get(`/tasks/project/${projectId}`),
        api.get('/admin/users')
      ]);
      
      const foundProject = projRes.data.find(p => p.id === parseInt(projectId));
      if (!foundProject) {
        showToast('Project not found', 'error');
        return router.push('/pm/dashboard');
      }

      setProject(foundProject);
      setTasks(taskRes.data);
      // Only keep team members
      setUsers(usersRes.data.filter(u => u.role === 'team_member' || u.role === 'project_manager'));
    } catch (err) {
      showToast('Failed to load project details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        project_id: projectId,
        ...newTask,
        assigned_to: newTask.assigned_to === '' ? null : newTask.assigned_to
      });
      showToast('Task created successfully');
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', assigned_to: '', due_date: '' });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create task', 'error');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      // Optimistic UI update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
      fetchData(); // Revert on failure
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      showToast('Task deleted successfully');
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      showToast('Failed to delete task', 'error');
    }
  };

  // Kanban Columns Definition
  const columns = [
    { id: 'to_do', title: 'To Do', color: 'bg-slate-100', dot: 'bg-slate-400' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-50', dot: 'bg-blue-500' },
    { id: 'review', title: 'In Review', color: 'bg-amber-50', dot: 'bg-amber-500' },
    { id: 'done', title: 'Done', color: 'bg-emerald-50', dot: 'bg-emerald-500' }
  ];

  if (loading) {
    return <div className="h-full flex items-center justify-center">Loading project details...</div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 h-full flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 shrink-0">
        <div className="flex items-center">
          <button 
            onClick={() => router.push('/pm/dashboard')}
            className="p-2 mr-4 bg-slate-50 text-slate-500 hover:text-primary hover:bg-blue-50 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{project?.title}</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Kanban Board & Task Management</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-5 py-2.5 bg-primary hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" /> New Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            
            return (
              <div key={col.id} className="w-80 flex flex-col h-full">
                {/* Column Header */}
                <div className={`px-4 py-3 rounded-t-2xl border-t border-x border-slate-200/60 flex items-center justify-between bg-white shrink-0`}>
                  <div className="flex items-center">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dot} mr-2`}></span>
                    <h3 className="font-bold text-slate-700">{col.title}</h3>
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-lg">
                    {colTasks.length}
                  </span>
                </div>
                
                {/* Column Body */}
                <div className={`flex-1 p-3 rounded-b-2xl border-b border-x border-slate-200/60 overflow-y-auto space-y-3 ${col.color}`}>
                  {colTasks.map(task => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={task.id}
                      className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm group hover:shadow-md transition-shadow relative"
                    >
                      <h4 className="font-bold text-slate-800 text-sm mb-2 pr-6">{task.title}</h4>
                      
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="absolute top-4 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {task.description && (
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2">{task.description}</p>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                        <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                          <UserIcon className="w-3.5 h-3.5 mr-1 text-primary" />
                          {task.assigned_to_name || 'Unassigned'}
                        </div>

                        {/* Status dropdown for PMs to move tasks */}
                        <div className="relative">
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                            className="appearance-none bg-transparent text-xs font-bold text-slate-400 hover:text-primary cursor-pointer outline-none focus:ring-0"
                          >
                            <option value="to_do">Move To Do</option>
                            <option value="in_progress">Move In Progress</option>
                            <option value="review">Move In Review</option>
                            <option value="done">Move Done</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Task Modal */}
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Create New Task</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-700"
                    placeholder="e.g. Design homepage mockup"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-700 resize-none"
                    placeholder="Detailed task description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Assign To</label>
                    <select
                      value={newTask.assigned_to}
                      onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-700"
                    >
                      <option value="">Unassigned</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Due Date</label>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-700"
                    />
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
                  >
                    Create Task
                  </button>
                </div>
              </form>
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
