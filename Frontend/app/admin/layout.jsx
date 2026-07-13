"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Users, LogOut, LayoutDashboard, Settings } from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

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

  if (!user) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <span className="text-xl font-bold text-slate-800 tracking-tight">Admin<span className="text-primary">Portal</span></span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname === '/admin/dashboard' && item.href === '/admin/users'); // we merge them for now
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                  ? 'bg-blue-50 text-primary font-medium shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                {item.name}
              </button>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center px-4 py-3 bg-slate-50 rounded-xl mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-slate-700 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm z-10">
          <h1 className="text-xl font-semibold text-slate-800">
            {pathname.includes('dashboard') ? 'User Management' : 'Admin Area'}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
