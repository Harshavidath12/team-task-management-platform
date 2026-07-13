"use client";

import { useState, useEffect, useMemo } from 'react';
import { Shield, Trash2, CheckCircle2, Clock, Search, Filter, AlertCircle, X, ChevronDown, Check, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../utils/api';

// --- Reusable Components ---

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

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, actionText }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm z-50 border border-slate-100"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-500 text-sm mb-6">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 shadow-sm shadow-red-200 transition-colors"
              >
                {actionText}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const StatCard = ({ title, value, label, colorClass }) => (
  <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-200/60 flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className={`w-2 h-2 rounded-full ${colorClass}`} />
    </div>
    <div>
      <h4 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h4>
      <p className="text-xs text-slate-400 mt-1 font-medium">{label}</p>
    </div>
  </div>
);

const SkeletonRow = () => (
  <tr className="border-b border-slate-100">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
          <div className="h-3 w-48 bg-slate-50 rounded animate-pulse" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4"><div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse" /></td>
    <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" /></td>
    <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-100 rounded-lg animate-pulse ml-auto" /></td>
  </tr>
);


// --- Main Page Component ---

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null });
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      showToast('Failed to fetch users. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/approve/${id}`);
      showToast('User approved successfully!');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve user', 'error');
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      showToast('User role updated seamlessly');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update role', 'error');
    }
  };

  const executeDelete = async () => {
    if (!deleteModal.userId) return;
    try {
      await api.delete(`/admin/users/${deleteModal.userId}`);
      showToast('User permanently deleted');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setDeleteModal({ isOpen: false, userId: null });
    }
  };

  // Derived State
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                            u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.is_approved).length,
    pending: users.filter(u => !u.is_approved).length,
    admins: users.filter(u => u.role === 'admin').length
  }), [users]);

  // Role Badge Config
  const roleConfig = {
    admin: { label: 'Admin', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    project_manager: { label: 'Manager', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    team_member: { label: 'Member', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-12">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.total} label="All registered accounts" colorClass="bg-blue-500" />
        <StatCard title="Active Users" value={stats.active} label="Approved and ready" colorClass="bg-emerald-500" />
        <StatCard title="Pending" value={stats.pending} label="Awaiting approval" colorClass="bg-amber-500" />
        <StatCard title="Administrators" value={stats.admins} label="Full system access" colorClass="bg-purple-500" />
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-visible flex flex-col">
        
        {/* Toolbar */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="project_manager">Project Managers</option>
                <option value="team_member">Team Members</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 rounded-tl-3xl">User details</th>
                <th scope="col" className="px-6 py-4">Role assignment</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-right rounded-tr-3xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
                </>
              ) : filteredUsers.length > 0 ? (
                <AnimatePresence>
                  {filteredUsers.map((u) => (
                    <motion.tr 
                      key={u.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                    >
                      {/* User Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 font-bold shadow-sm shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{u.name}</div>
                            <div className="text-slate-500 text-xs mt-0.5 font-medium">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Role Column */}
                      <td className="px-6 py-4 relative">
                        <div className="relative inline-block w-40">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className={`w-full appearance-none px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 ${roleConfig[u.role].color}`}
                          >
                            <option value="admin">Administrator</option>
                            <option value="project_manager">Project Manager</option>
                            <option value="team_member">Team Member</option>
                          </select>
                          <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-60`} />
                        </div>
                      </td>
                      
                      {/* Status Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {u.is_approved ? (
                            <>
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              <span className="text-xs font-semibold text-slate-700">Active</span>
                            </>
                          ) : (
                            <>
                              <span className="relative flex h-2 w-2">
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                              </span>
                              <span className="text-xs font-semibold text-slate-700">Pending</span>
                            </>
                          )}
                        </div>
                      </td>
                      
                      {/* Actions Column */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!u.is_approved && (
                            <button
                              onClick={() => handleApprove(u.id)}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-primary hover:text-blue-700 text-xs font-semibold rounded-lg transition-colors"
                            >
                              <Check className="w-3.5 h-3.5 mr-1.5" /> Approve
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, userId: u.id })}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <Search className="w-6 h-6 text-slate-300" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">No users found</h3>
                      <p className="text-xs text-slate-500 mt-1">We couldn't find anyone matching your current filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Modals & Toasts */}
      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, userId: null })}
        onConfirm={executeDelete}
        title="Delete User"
        message="Are you sure you want to permanently delete this user? All their data and assignments will be lost forever."
        actionText="Delete permanently"
      />

      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
      
    </div>
  );
}
