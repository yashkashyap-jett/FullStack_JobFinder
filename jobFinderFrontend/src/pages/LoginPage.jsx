import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn, Briefcase } from 'lucide-react';
import { loginApi } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  email:    z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const dest = from || (user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard');
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user, from, navigate]);

  const onSubmit = async (data) => {
    try {
      const res = await loginApi(data);
      login(res.data.user, res.data.accessToken);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const dest = from || (res.data.user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-brand-600/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-100 text-xl tracking-tight">
              Job<span className="gradient-text">Finder</span>
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-slate-100">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to continue your job journey</p>
        </div>

        <div className="glass-card p-8">
          <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="input-label" htmlFor="login-email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`input-field pl-10 ${errors.email ? 'border-red-500/60 focus:border-red-500' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="input-error">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="input-label" htmlFor="login-password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`input-field pl-10 ${errors.password ? 'border-red-500/60 focus:border-red-500' : ''}`}
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="input-error">{errors.password.message}</p>}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
