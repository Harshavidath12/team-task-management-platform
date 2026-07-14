"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import api from '@/utils/api';
import { FileText, CheckCircle, AlertCircle, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { overview, velocity, workload, submissions } = data;

  // Blue theme colors
  const COLORS = {
    primary: '#3B82F6', // Blue-500
    dark: '#0F172A', // Slate-900
    grid: '#E2E8F0', // Slate-200
    text: '#64748B', // Slate-500
  };

  const PIE_COLORS = {
    pending: COLORS.dark,
    submitted: COLORS.primary
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 items-start md:items-center">
        <div className="flex flex-col items-center justify-center bg-blue-50 p-6 rounded-xl min-w-[200px]">
          <BarChart2 className="w-10 h-10 text-primary mb-2" />
          <h2 className="text-lg font-bold text-slate-800">TeamReports</h2>
        </div>
        
        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">Team Overview</h1>
          <p className="text-slate-500 text-sm">Monitor team progress, workload distribution, and weekly reports.</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Reports</p>
            <h3 className="text-3xl font-bold text-slate-800">{overview.totalReports}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Compliance Rate</p>
            <h3 className="text-3xl font-bold text-primary">{overview.complianceRate}%</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Open Blockers</p>
            <h3 className="text-3xl font-bold text-slate-800">{overview.openBlockers}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
        </div>
      </div>

      {/* Task Velocity Trend */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Task Velocity Trend</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={velocity} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.text, fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.text, fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="tasks" 
                stroke={COLORS.primary} 
                strokeWidth={3}
                dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4, stroke: '#fff' }}
                activeDot={{ r: 6, fill: COLORS.primary, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Workload Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Workload Distribution</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workload} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                <XAxis dataKey="project" axisLine={false} tickLine={false} tick={{ fill: COLORS.text, fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.text, fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill={COLORS.dark} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Submission Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Submission Status</h3>
          <div className="h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={submissions}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {submissions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.status] || COLORS.primary} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Custom Legend */}
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-900"></div>
              <span className="text-sm text-slate-600 font-medium">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-sm text-primary font-medium">Submitted</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
