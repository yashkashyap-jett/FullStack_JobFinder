import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Briefcase, DollarSign, TrendingUp, TrendingDown,
  FileText, CheckCircle, XCircle, Clock, ArrowRight, AlertCircle
} from 'lucide-react';
import { getRecruiterDashboardApi } from '../../api/recruiter.api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getRecruiterDashboardApi()
      .then((res) => setDashboard(res.data.dashboard))
      .catch((err) => {
        const msg = err.response?.data?.message || 'Failed to load dashboard';
        setError(msg);
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

  const jobStats = dashboard?.jobStats;
  const appStats = dashboard?.applicationStats;

  return (
    <div className="page-wrapper">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="section-title">
          Recruiter Dashboard, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="section-subtitle">Overview of your job postings and applications.</p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-6 mb-6 flex items-start gap-4 border-amber-500/20"
        >
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">Company profile not set up yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Create your recruiter profile to start posting jobs.</p>
            <Link to="/recruiter/profile" className="btn-primary mt-3 inline-flex text-xs py-2 px-4">
              Set up Company Profile <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Job Stats */}
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Job Statistics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Briefcase}   label="Total Jobs"      value={jobStats?.totalJobs}     color="blue"   delay={0}    />
        <StatCard icon={DollarSign}  label="Avg. Salary"     value={jobStats?.averageSalary ? `$${Math.round(jobStats.averageSalary).toLocaleString()}` : '—'} color="emerald" delay={0.07} />
        <StatCard icon={TrendingUp}  label="Highest Salary"  value={jobStats?.maxSalary ? `$${Number(jobStats.maxSalary).toLocaleString()}` : '—'}  color="violet" delay={0.14} />
        <StatCard icon={TrendingDown} label="Lowest Salary"  value={jobStats?.minSalary ? `$${Number(jobStats.minSalary).toLocaleString()}` : '—'}  color="amber"  delay={0.21} />
      </div>

      {/* Application Stats */}
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Application Statistics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText}    label="Total Applications" value={appStats?.totalApplications} color="blue"   delay={0.28} />
        <StatCard icon={Clock}       label="Pending"            value={appStats?.applied}           color="amber"  delay={0.35} />
        <StatCard icon={CheckCircle} label="Accepted"           value={appStats?.accepted}          color="green"  delay={0.42} />
        <StatCard icon={XCircle}     label="Rejected"           value={appStats?.rejected}          color="red"    delay={0.49} />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="grid sm:grid-cols-2 gap-4"
      >
        {[
          { to: '/recruiter/jobs',    label: 'Manage Jobs',        desc: 'View and manage job postings',     icon: '💼' },
          { to: '/recruiter/profile', label: 'Company Profile',    desc: 'Update your company information',  icon: '🏢' },
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
    </div>
  );
}
