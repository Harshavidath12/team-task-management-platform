"use client";

import { useState, useEffect, Suspense } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Briefcase } from 'lucide-react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const actionParam = searchParams.get('action');
  
  const [isLogin, setIsLogin] = useState(true);
  
  useEffect(() => {
    if (actionParam === 'register') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [actionParam]);

  const toggleAuthMode = (mode) => {
    setMessage('');
    setError('');
    router.push(`/auth?action=${mode}`);
  };

  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      if (isLogin) {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        setMessage(res.data.message);
        // store token and redirect in the future...
      } else {
        const res = await axios.post('http://localhost:5000/api/auth/register', formData);
        
        // Show success message
        setMessage("Registration successful! Please wait for admin approval before logging in.");
        setFormData({ name: '', email: '', password: '', role: '' }); // Clear form
        
        // We do NOT auto-toggle to login so they can read the message clearly
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Visuals */}
        <div className="md:w-1/2 relative bg-blue-50 flex flex-col items-center justify-center p-8 hidden md:flex">
          <div className="absolute inset-0 z-0">
             <img 
               src="/login-bg.png" 
               alt="Desk with green lamp" 
               className="w-full h-full object-cover opacity-90"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent mix-blend-multiply"></div>
          </div>
          <div className="relative z-10 text-center text-white mt-auto pb-10">
            <h2 className="text-4xl font-bold mb-4 tracking-tight shadow-sm">Project Dashboard</h2>
            <p className="text-blue-100 text-lg max-w-md mx-auto">
              Manage your teams, tasks, and projects all in one premium platform.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">
              {isLogin ? "Hello There Wanderer!" : "Join Us Today!"}
            </h1>
            <h2 className="text-xl font-medium text-slate-600">
              Welcome to <span className="text-primary font-bold">ProjectPlatform</span>
            </h2>
          </div>

          {/* Toggle Login/Register */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-100 p-1 rounded-full inline-flex relative shadow-inner">
              <button
                type="button"
                onClick={() => toggleAuthMode('login')}
                className={`px-8 py-2 rounded-full font-medium transition-all duration-300 z-10 ${
                  isLogin ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => toggleAuthMode('register')}
                className={`px-8 py-2 rounded-full font-medium transition-all duration-300 z-10 ${
                  !isLogin ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-500 text-center mb-6">
            Please complete the {isLogin ? 'login' : 'registration'} process with your details
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {!isLogin && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name *"
                  autoComplete="off"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-slate-700"
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address *"
                autoComplete="off"
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-slate-700"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password *"
                autoComplete="new-password"
                required
                className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-slate-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                 <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleInputChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-slate-700 appearance-none"
                  >
                    <option value="" disabled>Role *</option>
                    <option value="team_member">Team Member</option>
                    <option value="project_manager">Project Manager</option>
                 </select>
              </div>
            )}

            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
            {message && <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg border border-green-100">{message}</div>}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-300 mt-4"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
