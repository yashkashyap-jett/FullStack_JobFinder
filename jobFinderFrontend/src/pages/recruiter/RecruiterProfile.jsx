import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Building2, Globe, MapPin, FileText, Edit2, Check } from 'lucide-react';
import {
  getRecruiterProfileApi,
  createRecruiterProfileApi,
  updateRecruiterProfileApi,
  uploadCompanyLogoApi,
} from '../../api/recruiter.api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import FileUpload from '../../components/FileUpload';

const schema = z.object({
  companyName:        z.string().min(2, 'Company name is required'),
  companyDescription: z.string().min(10, 'Description must be at least 10 chars'),
  companyWebsite:     z.string().url('Enter a valid URL (including https://)'),
  companyLocation:    z.string().min(2, 'Location is required'),
});

export default function RecruiterProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    register, handleSubmit, reset, formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const fetchProfile = () => {
    setLoading(true);
    getRecruiterProfileApi()
      .then((res) => {
        setProfile(res.data.recruiterProfile);
        reset(res.data.recruiterProfile);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setProfile(null);
          setEditMode(true);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProfile(); }, []);

  const onSubmit = async (data) => {
    try {
      let res;
      if (profile) {
        res = await updateRecruiterProfileApi(data);
        setProfile(res.data.updatedRecruiterProfile);
      } else {
        res = await createRecruiterProfileApi(data);
        setProfile(res.data.recruiterProfile);
      }
      setEditMode(false);
      toast.success('Company profile saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadCompanyLogoApi(file);
      setProfile(res.data.recruiter);
      toast.success('Company logo updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Logo upload failed');
    } finally {
      setUploading(false);
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
          <h1 className="section-title">Company Profile</h1>
          <p className="section-subtitle">Manage your recruiter and company information</p>
        </div>
        {profile && !editMode && (
          <button
            id="edit-company-btn"
            onClick={() => { setEditMode(true); reset(profile); }}
            className="btn-secondary"
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
        )}
      </div>

      {/* Company Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
        <div className="flex items-start gap-5 flex-wrap">
          {/* Logo */}
          <div className="shrink-0">
            {profile?.companyLogoUrl ? (
              <img
                src={profile.companyLogoUrl}
                alt="Company Logo"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-surface-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/30 to-brand-600/30 border-2 border-surface-700 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-violet-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-100">
              {profile?.companyName ?? user?.name}
            </h2>
            <p className="text-sm text-slate-400">{user?.email}</p>
            {profile?.companyLocation && (
              <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5" /> {profile.companyLocation}
              </p>
            )}
          </div>
        </div>

        {/* Logo upload */}
        {profile && (
          <div className="mt-5 pt-5 border-t border-surface-800">
            <FileUpload
              label="Update Company Logo"
              accept={['image/*']}
              hint="PNG, JPG up to 5MB"
              onFile={handleLogoUpload}
            />
            {uploading && <LoadingSpinner size="sm" className="mt-2" />}
          </div>
        )}
      </motion.div>

      {/* Profile Form/View */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-base font-semibold text-slate-100 mb-5">
          {profile ? (editMode ? 'Edit Company Details' : 'Company Details') : 'Set Up Company Profile'}
        </h2>

        <AnimatePresence mode="wait">
          {editMode || !profile ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              id="recruiter-profile-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <div>
                <label className="input-label" htmlFor="r-company-name">
                  <Building2 className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                  Company Name
                </label>
                <input
                  id="r-company-name"
                  type="text"
                  placeholder="Acme Corp"
                  className={`input-field ${errors.companyName ? 'border-red-500/60' : ''}`}
                  {...register('companyName')}
                />
                {errors.companyName && <p className="input-error">{errors.companyName.message}</p>}
              </div>

              <div>
                <label className="input-label" htmlFor="r-company-desc">
                  <FileText className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                  Company Description
                </label>
                <textarea
                  id="r-company-desc"
                  rows={3}
                  placeholder="Tell candidates about your company…"
                  className={`input-field resize-none ${errors.companyDescription ? 'border-red-500/60' : ''}`}
                  {...register('companyDescription')}
                />
                {errors.companyDescription && <p className="input-error">{errors.companyDescription.message}</p>}
              </div>

              <div>
                <label className="input-label" htmlFor="r-company-website">
                  <Globe className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                  Website
                </label>
                <input
                  id="r-company-website"
                  type="url"
                  placeholder="https://yourcompany.com"
                  className={`input-field ${errors.companyWebsite ? 'border-red-500/60' : ''}`}
                  {...register('companyWebsite')}
                />
                {errors.companyWebsite && <p className="input-error">{errors.companyWebsite.message}</p>}
              </div>

              <div>
                <label className="input-label" htmlFor="r-company-location">
                  <MapPin className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                  Location
                </label>
                <input
                  id="r-company-location"
                  type="text"
                  placeholder="San Francisco, CA"
                  className={`input-field ${errors.companyLocation ? 'border-red-500/60' : ''}`}
                  {...register('companyLocation')}
                />
                {errors.companyLocation && <p className="input-error">{errors.companyLocation.message}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button id="save-company-btn" type="submit" disabled={isSubmitting} className="btn-primary">
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
                { icon: Building2, label: 'Company Name',        value: profile.companyName },
                { icon: FileText,  label: 'Description',          value: profile.companyDescription },
                { icon: Globe,     label: 'Website',              value: profile.companyWebsite, isLink: true },
                { icon: MapPin,    label: 'Location',             value: profile.companyLocation },
              ].map(({ icon: Icon, label, value, isLink }) => (
                <div key={label} className="flex gap-3">
                  <Icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
                    {isLink ? (
                      <a
                        href={value}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-brand-400 hover:text-brand-300 transition-colors mt-0.5 inline-block"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-slate-200 mt-0.5 whitespace-pre-line">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
