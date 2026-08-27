'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      
      {/* LEFT SIDE - Visuals (Image) */}
      <div className="hidden lg:block w-[60%] relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/login-bg.jpg")' }}
        />
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center p-8 lg:p-12 xl:p-16 relative overflow-y-auto">
        <div className="w-full max-w-[400px] mx-auto flex flex-col">
          
          {/* Logo */}
          <div className="mb-10 flex items-center justify-start">
            <img src="/logo.png" alt="MAI Logo" className="w-24 h-24 object-contain" />
          </div>

          {/* Headings */}
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            Sign in to MAI
          </h1>
          <p className="text-[15px] text-slate-500 mb-8">
            Manage your fiber optic infrastructure efficiently.
          </p>



          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 w-full rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-slate-900">Email address*</Label>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900 focus-visible:border-slate-900 transition-all text-[15px]"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-slate-900">Password*</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900 focus-visible:border-slate-900 transition-all text-[15px] pr-10 font-mono tracking-widest pt-1"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 transition-colors outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded-sm border ${rememberMe ? 'bg-slate-900 border-slate-900' : 'border-slate-300 bg-white'} flex items-center justify-center transition-colors`}
                >
                  {rememberMe && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className="text-[14px] text-slate-500 font-medium cursor-pointer select-none" onClick={() => setRememberMe(!rememberMe)}>
                  Remember Me
                </span>
              </div>
              <a href="#" className="text-[14px] text-slate-900 font-medium hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 rounded-lg bg-[#111] hover:bg-black text-white font-medium text-[15px] transition-all shadow-sm mt-2"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </Button>
          </form>

        </div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
