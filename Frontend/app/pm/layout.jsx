"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, LogOut, Briefcase, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function PMLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth?action=login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'project_manager' && parsedUser.role !== 'admin') {
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
    { name: 'My Projects', href: '/pm/myprojects', icon: LayoutDashboard },
    { name: 'Team Reports', href: '/pm/reports', icon: FileText },
  ];

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <motion.div 
        animate={{ width: isCollapsed ? 80 : 288 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="bg-white shadow-xl shadow-slate-200/50 flex flex-col z-20 border-r border-slate-100 relative"
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-6 bg-white border border-slate-200 text-slate-500 hover:text-primary hover:border-blue-200 hover:bg-blue-50 rounded-full p-1.5 shadow-md transition-all z-30"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        
        {/* Brand */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100 overflow-hidden whitespace-nowrap">
          <div className="bg-primary/10 p-2 rounded-xl shrink-0">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight"
            >
              PM Portal
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`w-full flex items-center relative group ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'text-primary bg-blue-50/50 font-bold' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="pm-active-pill"
                    className="absolute inset-0 bg-blue-50 rounded-2xl border border-blue-100"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center w-full">
                  <item.icon className={`w-5 h-5 shrink-0 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'} ${!isCollapsed ? 'mr-3.5' : 'mx-auto'}`} />
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="tracking-wide text-[14px] whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* User Profile Area */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className={`flex items-center ${isCollapsed ? 'justify-center bg-transparent border-transparent shadow-none p-0' : 'bg-white p-3 rounded-2xl border border-slate-100 shadow-sm'} transition-all`}>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-primary flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 font-medium truncate capitalize">Project Manager</p>
              </motion.div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full mt-3 flex items-center justify-center ${isCollapsed ? 'px-0' : 'px-4'} py-2.5 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200`}
          >
            <LogOut className={`w-4 h-4 ${!isCollapsed ? 'mr-2' : ''}`} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </motion.div>

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
