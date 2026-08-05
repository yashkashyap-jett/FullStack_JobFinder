import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Trash2, AlertCircle } from 'lucide-react';
import { getMyApplicationsApi, withdrawApplicationApi } from '../../api/application.api';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CandidateApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(null);
  const [error, setError] = useState('');

  const fetchApplications = () => {
    setLoading(true);
    getMyApplicationsApi()
      .then((res) => setApplications(res.data.application || []))
      .catch((err) => {
        const msg = err.response?.data?.message || 'Failed to load applications';
        setError(msg);
        setApplications([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Withdraw this application?')) return;
    setWithdrawing(appId);
    try {
      await withdrawApplicationApi(appId);
      setApplications((prev) => prev.filter((a) => a._id !== appId));
      toast.success('Application withdrawn');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw');
    } finally {
      setWithdrawing(null);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="section-title">My Applications</h1>
        <p className="section-subtitle">
          {applications.length > 0
            ? `${applications.length} application${applications.length !== 1 ? 's' : ''} found`
            : "Track all the jobs you've applied to"}
        </p>
      </motion.div>

      {error && applications.length === 0 && (
        <div className="glass-card p-8 text-center">
          <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      )}

      {applications.length === 0 && !error && (
        <div className="glass-card p-12 text-center">
          <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-slate-300 font-medium mb-1">No applications yet</h3>
          <p className="text-sm text-slate-500">Start browsing and applying for jobs.</p>
        </div>
      )}

      {applications.length > 0 && (
        <div className="grid gap-4">
          {applications.map((app, i) => {
            const job = app.job ?? {};
            return (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 flex items-start justify-between gap-4 hover:border-surface-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 flex-wrap">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-600/30 to-violet-600/30 border border-surface-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-brand-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-100 truncate">
                        {job.title ?? 'Unknown Position'}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-1">
                        {job.location && (
                          <span className="text-xs text-slate-500">{job.location}</span>
                        )}
                        {job.salary && (
                          <span className="text-xs text-emerald-400">
                            ${Number(job.salary).toLocaleString()} / yr
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Applied {new Date(app.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <Badge variant={app.status} dot>{app.status}</Badge>

                  {app.status === 'applied' && (
                    <button
                      id={`withdraw-btn-${app._id}`}
                      onClick={() => handleWithdraw(app._id)}
                      disabled={withdrawing === app._id}
                      className="btn-danger text-xs py-1.5 px-3"
                    >
                      {withdrawing === app._id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          Withdraw
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
