import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { getCandidateDashboardApi } from '../../api/candidate.api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCandidateDashboardApi()
      .then((res) => setDashboard(res.data.dashboard))
      .catch((err) => {
        const msg = err.response?.data?.message || 'Failed to load dashboard';
        setError(msg);
        if (err.response?.status !== 404) toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = dashboard?.applicationStats;
  const recent = dashboard?.recentApplications ?? [];

  return (
    <div className="page-wrapper">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="section-title">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="section-subtitle">Here's your job search overview.</p>
      </motion.div>

      {/* No profile yet */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-6 mb-6 flex items-start gap-4 border-amber-500/20"
        >
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">Profile not set up yet</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Create your candidate profile to start applying for jobs.
            </p>
            <Link to="/candidate/profile" className="btn-primary mt-3 inline-flex text-xs py-2 px-4">
              Set up Profile <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText}    label="Total Applied"  value={stats?.totalApplications} color="blue"   delay={0}    />
        <StatCard icon={Clock}       label="Pending"        value={stats?.applied}           color="amber"  delay={0.07} />
        <StatCard icon={CheckCircle} label="Accepted"       value={stats?.accepted}          color="green"  delay={0.14} />
        <StatCard icon={XCircle}     label="Rejected"       value={stats?.rejected}          color="red"    delay={0.21} />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid sm:grid-cols-3 gap-4 mb-8"
      >
        {[
          { to: '/candidate/jobs',         label: 'Browse Jobs',      desc: 'Discover new opportunities', icon: '🔍' },
          { to: '/candidate/applications',  label: 'My Applications',  desc: 'Track your applications',    icon: '📋' },
          { to: '/candidate/profile',       label: 'Update Profile',   desc: 'Keep your profile fresh',    icon: '👤' },
        ].map(({ to, label, desc, icon }) => (
          <Link
            key={to}
            to={to}
            className="glass-card p-5 hover:border-brand-500/30 hover:-translate-y-0.5 transition-all duration-200 flex items-start gap-3"
          >
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="text-sm font-semibold text-slate-200">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Recent Applications */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-6 border-b border-surface-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-100">Recent Applications</h2>
          <Link to="/candidate/applications" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No applications yet. Start applying!</p>
            <Link to="/candidate/jobs" className="btn-primary inline-flex mt-4 text-sm py-2">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-surface-800">
            {recent.map((app, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="p-4 flex items-center justify-between gap-3 hover:bg-surface-800/30 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{app.jobTitle}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {app.location} · ${Number(app.salary || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <Badge variant={app.status} dot>{app.status}</Badge>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
