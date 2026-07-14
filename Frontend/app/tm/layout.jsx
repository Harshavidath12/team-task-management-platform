"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, LogOut, Briefcase, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TMLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth?action=login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'team_member' && parsedUser.role !== 'admin') {
      router.push('/auth?action=login');
      return;
    }

    setUser(parsedUser);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth?action=login');
  };

  const navigation = [
    { name: 'My Projects', href: '/tm/projects', icon: LayoutDashboard },
    { name: 'Submit Report', href: '/tm/reports', icon: FileText },
  ];

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-xl shadow-slate-200/50 flex flex-col z-20 border-r border-slate-100">
        
        {/* Brand */}
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="bg-emerald-500/10 p-2 rounded-xl mr-3">
            <Briefcase className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">
            TM Portal
          </span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`w-full flex items-center relative group px-4 py-3 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'text-emerald-700 bg-emerald-50/70 font-bold' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="tm-active-pill"
                    className="absolute inset-0 bg-emerald-50/70 rounded-2xl border border-emerald-100/50"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className={`w-5 h-5 mr-3.5 relative z-10 transition-colors duration-300 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="relative z-10 tracking-wide text-[14px]">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User Profile Area */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shadow-inner">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 font-medium truncate capitalize">Team Member</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-3 flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="p-8 pb-24 h-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
