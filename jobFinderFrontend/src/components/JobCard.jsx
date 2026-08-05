import { motion } from 'framer-motion';
import { MapPin, DollarSign, Building2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * JobCard — card showing job summary. Used in listings and bookmarks.
 * job: { _id, title, salary, location, postedBy: { companyName } }
 */
export default function JobCard({ job, actions, delay = 0, linkTo }) {
  const company = job?.postedBy?.companyName || job?.postedBy || 'Unknown Company';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="glass-card p-5 hover:border-brand-500/30 hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Company */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{company}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-slate-100 group-hover:text-brand-400 transition-colors line-clamp-2">
            {job?.title ?? 'Untitled Position'}
          </h3>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 mt-2">
            {job?.location && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {job.location}
              </span>
            )}
            {job?.salary && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <DollarSign className="w-3.5 h-3.5 shrink-0" />
                {Number(job.salary).toLocaleString()} / yr
              </span>
            )}
          </div>
        </div>

        {/* External link */}
        {linkTo && (
          <Link
            to={linkTo}
            className="shrink-0 p-2 rounded-lg text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
            title="View details"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Actions slot */}
      {actions && (
        <div className="mt-4 pt-4 border-t border-surface-800 flex items-center gap-2 flex-wrap">
          {actions}
        </div>
      )}
    </motion.div>
  );
}
