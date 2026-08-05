import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Search, Shield, Zap, ArrowRight, Users, Building2, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: Search,
    title: 'Smart Job Discovery',
    desc: 'Search and filter jobs by title, location, and salary with real-time results.',
    color: 'brand',
  },
  {
    icon: Shield,
    title: 'Secure Applications',
    desc: 'Apply with confidence using verified profiles and JWT-secured sessions.',
    color: 'violet',
  },
  {
    icon: Zap,
    title: 'Instant Notifications',
    desc: 'Know immediately when your application status changes from recruiters.',
    color: 'amber',
  },
  {
    icon: TrendingUp,
    title: 'Career Dashboard',
    desc: 'Track all your applications with detailed analytics and status breakdowns.',
    color: 'emerald',
  },
];

const colorMap = {
  brand:   'text-brand-400 bg-brand-500/10 border-brand-500/20',
  violet:  'text-violet-400 bg-violet-500/10 border-violet-500/20',
  amber:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

const stats = [
  { icon: Briefcase, label: 'Jobs Listed', value: '10K+' },
  { icon: Users,     label: 'Candidates', value: '50K+' },
  { icon: Building2, label: 'Companies',  value: '2K+' },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const dashboardLink = user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard';

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-24 pb-20 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/10 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-violet-600/8 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="relative z-10 max-w-3xl"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-sm font-medium">
              <Zap className="w-3.5 h-3.5" />
              The modern job marketplace
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-100 leading-[1.1] tracking-tight"
          >
            Find Your Dream{' '}
            <span className="gradient-text">Career</span>{' '}
            Today
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg text-slate-400 max-w-xl mx-auto leading-relaxed"
          >
            Connect with top companies, apply with one click, and track every step of your
            job search — all from one beautifully crafted platform.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            {isAuthenticated ? (
              <Link to={dashboardLink} className="btn-primary text-base px-8 py-3.5">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/register" id="hero-get-started-btn" className="btn-primary text-base px-8 py-3.5">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
                  Sign In
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className="py-12 border-y border-surface-800/60">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <Icon className="w-5 h-5 text-brand-400" />
                <p className="text-3xl font-bold text-slate-100">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-100">Everything you need to land your next role</h2>
            <p className="mt-3 text-slate-400">Powerful tools for both job seekers and recruiters.</p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={containerVariants}
            className="grid sm:grid-cols-2 gap-5"
          >
            {features.map(({ icon: Icon, title, desc, color }) => (
              <motion.div
                key={title}
                variants={itemVariants}
                className="glass-card p-6 hover:border-surface-700 transition-colors duration-200"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${colorMap[color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="glass-card p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-violet-600/10 pointer-events-none" />
              <h2 className="relative text-3xl font-bold text-slate-100 mb-3">
                Ready to find your next opportunity?
              </h2>
              <p className="relative text-slate-400 mb-8">
                Join thousands of professionals using JobFinder to accelerate their careers.
              </p>
              <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/register?role=candidate" className="btn-primary px-8 py-3">
                  Join as Candidate <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/register?role=recruiter" className="btn-secondary px-8 py-3">
                  Post Jobs as Recruiter
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-surface-800 py-8 text-center text-sm text-slate-600">
        © {new Date().getFullYear()} JobFinder. Built with React + Node.js + MongoDB.
      </footer>
    </div>
  );
}
