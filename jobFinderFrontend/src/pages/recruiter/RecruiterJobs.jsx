import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Briefcase, Plus, X, MapPin, DollarSign, FileText,
  ChevronDown, ChevronUp, Edit2, Trash2, Users, Check, PenLine
} from 'lucide-react';
import { getAllJobsApi, createJobApi, updateJobApi, deleteJobApi } from '../../api/job.api';
import { getRecruiterProfileApi } from '../../api/recruiter.api';
import { getApplicantsForJobApi, updateApplicationStatusApi } from '../../api/application.api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import toast_import from 'react-hot-toast';

const jobSchema = z.object({
  title:       z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 chars'),
  salary:      z.coerce.number().min(0, 'Salary must be ≥ 0'),
  location:    z.string().min(2, 'Location is required'),
});

// ────────────────────────────────────────────────────────────
// Job Form Modal (create / edit)
// ────────────────────────────────────────────────────────────
function JobFormModal({ isOpen, onClose, onSaved, editingJob }) {
  const isEdit = !!editingJob;

  const {
    register, handleSubmit, reset, formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: editingJob
      ? { title: editingJob.title, description: editingJob.description, salary: editingJob.salary, location: editingJob.location }
      : {},
  });

  useEffect(() => {
    if (isOpen) {
      reset(editingJob
        ? { title: editingJob.title, description: editingJob.description, salary: editingJob.salary, location: editingJob.location }
        : { title: '', description: '', salary: '', location: '' }
      );
    }
  }, [isOpen, editingJob, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        const res = await updateJobApi(editingJob._id, data);
        onSaved(res.data.job, true);
        toast.success('Job updated!');
      } else {
        const res = await createJobApi(data);
        onSaved(res.data.job, false);
        toast.success('Job posted!');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save job');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-lg glass-card p-6 shadow-2xl"
        style={{ border: '1px solid rgba(59,110,246,0.25)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-100">
            {isEdit ? 'Edit Job' : 'Post a New Job'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="job-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="input-label" htmlFor="j-title">Job Title</label>
            <input
              id="j-title"
              type="text"
              placeholder="e.g. Senior React Developer"
              className={`input-field ${errors.title ? 'border-red-500' : ''}`}
              {...register('title')}
            />
            {errors.title && <p className="input-error">{errors.title.message}</p>}
          </div>

          <div>
            <label className="input-label" htmlFor="j-location">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                id="j-location"
                type="text"
                placeholder="e.g. Remote, New York, London"
                className={`input-field pl-9 ${errors.location ? 'border-red-500' : ''}`}
                {...register('location')}
              />
            </div>
            {errors.location && <p className="input-error">{errors.location.message}</p>}
          </div>

          <div>
            <label className="input-label" htmlFor="j-salary">Annual Salary (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                id="j-salary"
                type="number"
                placeholder="e.g. 90000"
                className={`input-field pl-9 ${errors.salary ? 'border-red-500' : ''}`}
                {...register('salary')}
              />
            </div>
            {errors.salary && <p className="input-error">{errors.salary.message}</p>}
          </div>

          <div>
            <label className="input-label" htmlFor="j-desc">Description</label>
            <textarea
              id="j-desc"
              rows={4}
              placeholder="Describe responsibilities, requirements, and benefits…"
              className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`}
              {...register('description')}
            />
            {errors.description && <p className="input-error">{errors.description.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button id="save-job-btn" type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting
                ? <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving…</span>
                : <><Check className="w-4 h-4" />{isEdit ? 'Update Job' : 'Post Job'}</>
              }
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Applicants panel per job
// ────────────────────────────────────────────────────────────
function ApplicantsPanel({ jobId }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    getApplicantsForJobApi(jobId)
      .then((res) => setApplicants(res.data.application || []))
      .catch(() => setApplicants([]))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleStatus = async (appId, status) => {
    setUpdatingId(appId);
    try {
      await updateApplicationStatusApi(appId, status);
      setApplicants((prev) => prev.map((a) => a._id === appId ? { ...a, status } : a));
      toast.success(`Application ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="py-6 flex justify-center"><LoadingSpinner size="sm" /></div>;

  if (applicants.length === 0) {
    return (
      <div className="py-8 text-center">
        <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No applicants yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-800">
      {applicants.map((app, i) => {
        const candidate = app.candidate ?? {};
        return (
          <motion.div
            key={app._id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="p-4 flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #2550eb, #7c3aed)' }}>
                  C
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">
                    {candidate.skills ? `Skills: ${candidate.skills}` : 'Candidate'}
                  </p>
                  {candidate.education && (
                    <p className="text-xs text-slate-500 truncate">{candidate.education} · {candidate.experience}yr exp</p>
                  )}
                  {candidate.resumeUrl && (
                    <a href={candidate.resumeUrl} target="_blank" rel="noreferrer"
                      className="text-xs transition-colors" style={{ color: '#6091fa' }}>
                      View Resume →
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={app.status} dot>{app.status}</Badge>

              {app.status === 'applied' && (
                <div className="flex gap-1.5">
                  <button
                    id={`accept-${app._id}`}
                    onClick={() => handleStatus(app._id, 'accepted')}
                    disabled={updatingId === app._id}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}
                  >
                    {updatingId === app._id ? <LoadingSpinner size="sm" /> : 'Accept'}
                  </button>
                  <button
                    id={`reject-${app._id}`}
                    onClick={() => handleStatus(app._id, 'rejected')}
                    disabled={updatingId === app._id}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}
                  >
                    {updatingId === app._id ? <LoadingSpinner size="sm" /> : 'Reject'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────
export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recruiterProfileId, setRecruiterProfileId] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Expanded applicants
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch recruiter profile to get their _id for filtering jobs
  useEffect(() => {
    getRecruiterProfileApi()
      .then((res) => {
        const profileId = res.data.recruiterProfile?._id;
        setRecruiterProfileId(profileId);
        if (profileId) fetchJobs(profileId);
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchJobs = (profileId) => {
    setLoading(true);
    getAllJobsApi({ postedBy: profileId, limit: 50 })
      .then((res) => setJobs(res.data.jobs || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  const handleSaved = (job, isEdit) => {
    if (isEdit) {
      setJobs((prev) => prev.map((j) => j._id === job._id ? job : j));
    } else {
      setJobs((prev) => [job, ...prev]);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setModalOpen(true);
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this job posting? This cannot be undone.')) return;
    setDeletingId(jobId);
    try {
      await deleteJobApi(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      if (expandedJobId === jobId) setExpandedJobId(null);
      toast.success('Job deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete job');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleApplicants = (jobId) => {
    setExpandedJobId((prev) => prev === jobId ? null : jobId);
  };

  return (
    <>
      {/* Job form modal */}
      <AnimatePresence>
        {modalOpen && (
          <JobFormModal
            isOpen={modalOpen}
            onClose={() => { setModalOpen(false); setEditingJob(null); }}
            onSaved={handleSaved}
            editingJob={editingJob}
          />
        )}
      </AnimatePresence>

      <div className="page-wrapper">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="section-title">Manage Jobs</h1>
            <p className="section-subtitle">
              {jobs.length > 0
                ? `${jobs.length} job posting${jobs.length !== 1 ? 's' : ''}`
                : 'Post and manage your job listings'}
            </p>
          </div>

          <button
            id="post-job-btn"
            onClick={() => { setEditingJob(null); setModalOpen(true); }}
            className="btn-primary gap-2"
          >
            <Plus className="w-4 h-4" />
            Post a Job
          </button>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* No profile */}
        {!loading && !recruiterProfileId && (
          <div className="glass-card p-12 text-center">
            <Briefcase className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-300 font-medium mb-1">Company profile required</p>
            <p className="text-sm text-slate-500 mb-4">Set up your company profile before posting jobs.</p>
            <a href="/recruiter/profile" className="btn-primary inline-flex">Go to Profile</a>
          </div>
        )}

        {/* Empty state */}
        {!loading && recruiterProfileId && jobs.length === 0 && (
          <div className="glass-card p-16 text-center">
            <Briefcase className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-slate-300 font-medium mb-1">No jobs posted yet</h3>
            <p className="text-sm text-slate-500 mb-4">Click "Post a Job" to create your first listing.</p>
            <button
              onClick={() => { setEditingJob(null); setModalOpen(true); }}
              className="btn-primary inline-flex gap-2"
            >
              <Plus className="w-4 h-4" /> Post First Job
            </button>
          </div>
        )}

        {/* Job list */}
        {!loading && jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden"
              >
                {/* Job header */}
                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-slate-100 truncate">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-1.5">
                      {job.location && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          {job.location}
                        </span>
                      )}
                      {job.salary && (
                        <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#34d399' }}>
                          <DollarSign className="w-3.5 h-3.5 shrink-0" />
                          {Number(job.salary).toLocaleString()} / yr
                        </span>
                      )}
                      <span className="text-xs text-slate-600">
                        Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* View applicants */}
                    <button
                      id={`view-applicants-${job._id}`}
                      onClick={() => toggleApplicants(job._id)}
                      className="btn-secondary gap-1.5 text-xs py-2 px-3"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Applicants
                      {expandedJobId === job._id
                        ? <ChevronUp className="w-3.5 h-3.5" />
                        : <ChevronDown className="w-3.5 h-3.5" />
                      }
                    </button>

                    {/* Edit */}
                    <button
                      id={`edit-job-${job._id}`}
                      onClick={() => handleEdit(job)}
                      className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      id={`delete-job-${job._id}`}
                      onClick={() => handleDelete(job._id)}
                      disabled={deletingId === job._id}
                      className="p-2 rounded-lg border transition-all"
                      style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                    >
                      {deletingId === job._id
                        ? <LoadingSpinner size="sm" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>

                {/* Applicants panel */}
                <AnimatePresence>
                  {expandedJobId === job._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden border-t border-slate-800"
                    >
                      <div className="px-5 py-3 flex items-center gap-2 bg-slate-900/40">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Applicants</span>
                      </div>
                      <ApplicantsPanel jobId={job._id} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
