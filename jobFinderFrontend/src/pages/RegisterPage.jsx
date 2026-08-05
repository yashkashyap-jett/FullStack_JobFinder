import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Briefcase, UserCheck } from 'lucide-react';
import { registerApi } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role:     z.enum(['candidate', 'recruiter'], { required_error: 'Please select a role' }),
});

export default function RegisterPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'candidate';

  const {
    register, handleSubmit, watch, formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (isAuthenticated) navigate('/candidate/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      const res = await registerApi(data);
      login(res.data.user, res.data.accessToken);
      toast.success('Account created! Welcome aboard 🎉');
      const dest = res.data.user.role === 'recruiter' ? '/recruiter/profile' : '/candidate/profile';
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-violet-600/8 rounded-full blur-3xl" />
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
          <h1 className="mt-6 text-2xl font-bold text-slate-100">Create your account</h1>
          <p className="mt-2 text-sm text-slate-400">Start your journey with JobFinder</p>
        </div>

        <div className="glass-card p-8">
          <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Role Toggle */}
            <div>
              <label className="input-label">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {(['candidate', 'recruiter'] ).map((r) => (
                  <label
                    key={r}
                    className={`
                      flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200
                      ${selectedRole === r
                        ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                        : 'border-surface-700 hover:border-surface-600 text-slate-400 hover:text-slate-300'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      value={r}
                      className="sr-only"
                      {...register('role')}
                    />
                    {r === 'candidate'
                      ? <UserCheck className="w-4 h-4 shrink-0" />
                      : <Briefcase className="w-4 h-4 shrink-0" />
                    }
                    <span className="text-sm font-medium capitalize">{r}</span>
                  </label>
                ))}
              </div>
              {errors.role && <p className="input-error">{errors.role.message}</p>}
            </div>

            {/* Name */}
            <div>
              <label className="input-label" htmlFor="reg-name">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  className={`input-field pl-10 ${errors.name ? 'border-red-500/60' : ''}`}
                  {...register('name')}
                />
              </div>
              {errors.name && <p className="input-error">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="input-label" htmlFor="reg-email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`input-field pl-10 ${errors.email ? 'border-red-500/60' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="input-error">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="input-label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  className={`input-field pl-10 ${errors.password ? 'border-red-500/60' : ''}`}
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="input-error">{errors.password.message}</p>}
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating account…
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
