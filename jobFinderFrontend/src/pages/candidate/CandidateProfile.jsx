import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, BookOpen, Briefcase, Edit2, Check, ExternalLink } from 'lucide-react';
import {
  getCandidateProfileApi,
  createCandidateProfileApi,
  updateCandidateProfileApi,
  uploadResumeApi,
  uploadProfilePhotoApi,
} from '../../api/candidate.api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import FileUpload from '../../components/FileUpload';

const schema = z.object({
  skills:     z.string().min(2, 'Skills are required'),
  education:  z.string().min(2, 'Education is required'),
  experience: z.coerce.number().min(0, 'Must be ≥ 0').max(50),
});

export default function CandidateProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState({ resume: false, photo: false });

  const {
    register, handleSubmit, reset, formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const fetchProfile = () => {
    setLoading(true);
    getCandidateProfileApi()
      .then((res) => {
        const p = res.data.candidateProfile;
        setProfile(p);
        reset({ skills: p.skills, education: p.education, experience: p.experience });
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setProfile(null);
          setEditMode(true); // auto-open create form
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProfile(); }, []);

  const onSubmit = async (data) => {
    try {
      let res;
      if (profile) {
        // Profile exists — UPDATE via PUT /candidate/profile
        res = await updateCandidateProfileApi(data);
        setProfile(res.data.candidateProfile);
        toast.success('Profile updated!');
      } else {
        // No profile — CREATE via POST /candidate/create-profile
        res = await createCandidateProfileApi(data);
        setProfile(res.data.candidateProfile);
        toast.success('Profile created!');
      }
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    }
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;
    setUploading((u) => ({ ...u, resume: true }));
    try {
      const res = await uploadResumeApi(file);
      setProfile((prev) => ({ ...prev, resumeUrl: res.data.candidate?.resumeUrl }));
      toast.success('Resume uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resume upload failed');
    } finally {
      setUploading((u) => ({ ...u, resume: false }));
    }
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploading((u) => ({ ...u, photo: true }));
    try {
      const res = await uploadProfilePhotoApi(file);
      setProfile((prev) => ({ ...prev, profilePhotoUrl: res.data.candidate?.profilePhotoUrl }));
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Photo upload failed');
    } finally {
      setUploading((u) => ({ ...u, photo: false }));
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
    <div className="page-wrapper max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title">My Profile</h1>
          <p className="section-subtitle">Manage your professional information</p>
        </div>
        {profile && !editMode && (
          <button
            id="edit-profile-btn"
            onClick={() => {
              reset({ skills: profile.skills, education: profile.education, experience: profile.experience });
              setEditMode(true);
            }}
            className="btn-secondary gap-2"
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
        )}
      </div>

      {/* Avatar + basic info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="shrink-0">
            {profile?.profilePhotoUrl ? (
              <img
                src={profile.profilePhotoUrl}
                alt="Profile"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white border-2 border-slate-700"
                style={{ background: 'linear-gradient(135deg, #2550eb, #7c3aed)' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-100">{user?.name}</h2>
            <p className="text-sm text-slate-400">{user?.email}</p>
            {profile && (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="badge text-xs px-2.5 py-1" style={{ background: 'rgba(59,110,246,0.1)', color: '#6091fa', border: '1px solid rgba(59,110,246,0.2)' }}>
                  {profile.experience} yr{profile.experience !== 1 ? 's' : ''} experience
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Photo upload */}
        {profile && (
          <div className="mt-5 pt-5 border-t border-slate-800">
            <FileUpload
              label="Update Profile Photo"
              accept={['image/*']}
              hint="PNG, JPG up to 5MB"
              onFile={handlePhotoUpload}
            />
            {uploading.photo && <LoadingSpinner size="sm" className="mt-2" />}
          </div>
        )}
      </motion.div>

      {/* Profile form / view */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h2 className="text-base font-semibold text-slate-100 mb-5">
          {!profile ? 'Create Your Profile' : editMode ? 'Edit Professional Details' : 'Professional Details'}
        </h2>

        <AnimatePresence mode="wait">
          {(editMode || !profile) ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              id="candidate-profile-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <div>
                <label className="input-label" htmlFor="c-skills">
                  <Briefcase className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                  Skills
                </label>
                <input
                  id="c-skills"
                  type="text"
                  placeholder="e.g. React, Node.js, Python"
                  className={`input-field ${errors.skills ? 'border-red-500' : ''}`}
                  {...register('skills')}
                />
                {errors.skills && <p className="input-error">{errors.skills.message}</p>}
              </div>

              <div>
                <label className="input-label" htmlFor="c-education">
                  <BookOpen className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                  Education
                </label>
                <input
                  id="c-education"
                  type="text"
                  placeholder="e.g. B.Tech Computer Science, MIT"
                  className={`input-field ${errors.education ? 'border-red-500' : ''}`}
                  {...register('education')}
                />
                {errors.education && <p className="input-error">{errors.education.message}</p>}
              </div>

              <div>
                <label className="input-label" htmlFor="c-experience">
                  <User className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                  Experience (years)
                </label>
                <input
                  id="c-experience"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="e.g. 3"
                  className={`input-field ${errors.experience ? 'border-red-500' : ''}`}
                  {...register('experience')}
                />
                {errors.experience && <p className="input-error">{errors.experience.message}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  id="save-profile-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {profile ? 'Update Profile' : 'Create Profile'}
                    </>
                  )}
                </button>
                {profile && (
                  <button type="button" onClick={() => setEditMode(false)} className="btn-secondary">
                    Cancel
                  </button>
                )}
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {[
                { icon: Briefcase, label: 'Skills',      value: profile.skills },
                { icon: BookOpen,  label: 'Education',   value: profile.education },
                { icon: User,      label: 'Experience',  value: `${profile.experience} year${profile.experience !== 1 ? 's' : ''}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <Icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
                    <p className="text-sm text-slate-200 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Resume */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mt-6"
        >
          <h2 className="text-base font-semibold text-slate-100 mb-5">Resume</h2>
          {profile.resumeUrl && (
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm mb-4 transition-colors"
              style={{ color: '#6091fa' }}
            >
              <ExternalLink className="w-4 h-4" />
              View current resume
            </a>
          )}
          <FileUpload
            label="Upload / Replace Resume"
            accept={['application/pdf']}
            hint="PDF only, up to 10MB"
            onFile={handleResumeUpload}
          />
          {uploading.resume && (
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
              <LoadingSpinner size="sm" /> Uploading…
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
