'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthProvider, useAuth, INITIAL_AUTH_USERS } from '@/hooks/useAuth';
import { Eye, EyeOff, AlertCircle, Loader2, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

function LoginForm() {
  const { login, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Jika pengguna sudah memiliki sesi login aktif, arahkan langsung ke halaman tujuan atau dashboard
  useEffect(() => {
    if (!authLoading && user) {
      const redirect = searchParams?.get('redirect') || '/';
      window.location.href = redirect;
    }
  }, [user, authLoading, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email.trim(), password.trim(), rememberMe);
      const redirect = searchParams?.get('redirect') || '/';
      window.location.href = redirect;
    } catch (err: any) {
      setError(err.message || 'Email atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (username: string, pass: string) => {
    setEmail(username);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      {/* LEFT SIDE - Visuals */}
      <div className="hidden lg:block w-[60%] relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/login-bg-new.jpg")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-12 text-white">
          <span className="text-xs uppercase tracking-widest font-semibold px-3 py-1 bg-white/20 backdrop-blur-md rounded-full w-fit mb-3">
            Proper Enterprise
          </span>
          <h2 className="text-3xl font-bold tracking-tight">
            Sistem Manajemen & Kontrol Proyek
          </h2>
          <p className="text-sm text-slate-200 mt-2 max-w-lg">
            Pantau progres S-Curve, approval material, GIS, logistik, dan laporan harian proyek secara terintegrasi.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center p-8 lg:p-12 xl:p-16 relative overflow-y-auto">
        <div className="w-full max-w-[400px] mx-auto flex flex-col">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <img
              src="/images/logo-pt-mitra-akses-insani.png"
              alt="Proper Logo"
              className="w-14 h-14 object-contain"
            />
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-none">Proper</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Project Performance App</p>
            </div>
          </div>

          {/* Headings */}
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            Sign in to Proper
          </h1>
          <p className="text-[14px] text-slate-500 mb-6">
            PT Mitra Akses Insani - Masuk dengan akun Anda untuk melanjutkan.
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 w-full rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            {/* Username / Email Input */}
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-slate-900">
                Username atau Email*
              </Label>
              <Input
                type="text"
                placeholder="admin atau email@mai.co.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
                spellCheck={false}
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
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="current-password"
                  spellCheck={false}
                  className="h-11 rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900 focus-visible:border-slate-900 transition-all text-[15px] pr-10 tracking-widest pt-1"
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

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-[14px] text-slate-600 font-medium">Ingat Saya</span>
              </label>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
              >
                <Info className="w-3.5 h-3.5" />
                {showHint ? 'Tutup Akun Demo' : 'Daftar Akun'}
              </button>
            </div>

            {/* Hint Akun Demo */}
            {showHint && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-2">
                <p className="font-semibold text-slate-800">Klik untuk isi otomatis:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {INITIAL_AUTH_USERS.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleQuickFill(acc.username, acc.password)}
                      className="text-left px-2 py-1.5 rounded bg-white hover:bg-slate-100 border text-[11px] transition-colors"
                    >
                      <div className="font-bold text-slate-800">{acc.username}</div>
                      <div className="text-slate-400">{acc.role}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 rounded-lg bg-[#111] hover:bg-black text-white font-medium text-[15px] transition-all shadow-sm mt-2 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Memverifikasi...
                </span>
              ) : (
                'Sign In'
              )}
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
      <Suspense fallback={<div className="min-h-screen w-full bg-white flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>}>
        <LoginForm />
      </Suspense>
    </AuthProvider>
  );
}
