"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Users, LogOut, LayoutDashboard, Settings, ChevronLeft, ChevronRight, CheckSquare, Folder, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth?action=login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        router.push('/dashboard');
      } else {
        setUser(parsedUser);
      }
    } catch (e) {
      router.push('/auth?action=login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth?action=login');
  };

  if (!user) return (
    <div className="min-h-screen bg-[#F7F7F9] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full"
        />
        <p className="text-sm text-slate-500 font-medium">Loading Workspace...</p>
      </div>
    </div>
  );

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Project Management', href: '/admin/projects', icon: Folder },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  ];

  return (
    <div className="h-screen bg-[#F7F7F9] flex overflow-hidden">
      {/* Sidebar */}
      <motion.div 
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="bg-white border-r border-slate-200/60 flex flex-col shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] relative z-20"
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-6 bg-white border border-slate-200 text-slate-500 hover:text-primary hover:border-blue-200 hover:bg-blue-50 rounded-full p-1.5 shadow-md transition-all z-30"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Logo Area */}
        <div className="h-[72px] flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-inner">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-lg font-bold text-slate-800 tracking-tight"
              >
                Project<span className="text-primary">Platform</span>
              </motion.span>
            )}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center relative group px-3 py-2.5 rounded-xl transition-colors duration-200 ${
                  isActive 
                  ? 'text-primary' 
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-blue-50/80 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3 w-full">
                  <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500'}`} />
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="font-medium text-sm whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Profile Section */}
        <div className="p-4 border-t border-slate-100">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-3 rounded-xl mb-2 transition-all hover:bg-slate-50 group cursor-pointer`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center text-primary font-bold shrink-0 shadow-sm">
              {user.name.charAt(0)}
            </div>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize font-medium">{user.role.replace('_', ' ')}</p>
              </motion.div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center justify-center ${isCollapsed ? 'px-0' : 'px-4'} py-2.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200`}
          >
            <LogOut className={`w-[18px] h-[18px] ${!isCollapsed && 'mr-2'}`} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
        <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center px-8 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {pathname.includes('dashboard') ? 'Team Directory' : 
               pathname.includes('projects') ? 'Project Portfolio' : 'Administration'}
            </h1>
            <p className="text-xs font-medium text-slate-500">
              {pathname.includes('dashboard') ? 'Manage your workspace access and permissions' : 
               pathname.includes('projects') ? 'Track and manage all team projects' : 'System settings'}
            </p>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
