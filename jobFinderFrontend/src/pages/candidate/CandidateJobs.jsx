import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, DollarSign, SlidersHorizontal, X,
  ChevronLeft, ChevronRight, Bookmark, BookmarkCheck,
  Briefcase, Building2
} from 'lucide-react';
import { getAllJobsApi } from '../../api/job.api';
import { applyForJobApi } from '../../api/application.api';
import { bookmarkJobApi } from '../../api/bookmark.api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: '',            label: 'Relevance' },
  { value: 'latest',     label: 'Newest First' },
  { value: 'oldest',     label: 'Oldest First' },
  { value: 'salary_desc',label: 'Salary: High → Low' },
  { value: 'salary_asc', label: 'Salary: Low → High' },
];

export default function CandidateJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalJobs: 0 });

  // Filters
  const [search, setSearch]       = useState('');
  const [location, setLocation]   = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [sort, setSort]           = useState('latest');
  const [page, setPage]           = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Per-job state
  const [applyingId,   setApplyingId]   = useState(null);
  const [bookmarkingId, setBookmarkingId] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [appliedIds,    setAppliedIds]    = useState(new Set());

  // Expanded job detail
  const [expandedId, setExpandedId] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9, sort };
      if (search)    params.search    = search;
      if (location)  params.location  = location;
      if (minSalary) params.minSalary = minSalary;
      if (maxSalary) params.maxSalary = maxSalary;

      const res = await getAllJobsApi(params);
      setJobs(res.data.jobs || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages:  res.data.totalPages,
        totalJobs:   res.data.totalJobs,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, location, minSalary, maxSalary]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Reset to page 1 on filter change
  const applyFilters = (e) => { e.preventDefault(); setPage(1); fetchJobs(); };

  const clearFilters = () => {
    setSearch(''); setLocation(''); setMinSalary(''); setMaxSalary(''); setSort('latest');
    setPage(1);
  };

  const handleApply = async (jobId) => {
    if (appliedIds.has(jobId)) return;
    setApplyingId(jobId);
    try {
      await applyForJobApi(jobId);
      setAppliedIds((prev) => new Set(prev).add(jobId));
      toast.success('Application submitted! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplyingId(null);
    }
  };

  const handleBookmark = async (jobId) => {
    if (bookmarkedIds.has(jobId)) return;
    setBookmarkingId(jobId);
    try {
      await bookmarkJobApi(jobId);
      setBookmarkedIds((prev) => new Set(prev).add(jobId));
      toast.success('Bookmarked!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Already bookmarked or failed');
    } finally {
      setBookmarkingId(null);
    }
  };

  const hasFilters = search || location || minSalary || maxSalary;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="section-title">Browse Jobs</h1>
        <p className="section-subtitle">
          {pagination.totalJobs > 0
            ? `${pagination.totalJobs.toLocaleString()} job${pagination.totalJobs !== 1 ? 's' : ''} found`
            : 'Explore opportunities'}
        </p>
      </motion.div>

      {/* Search + Filter bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <form onSubmit={applyFilters} className="glass-card p-4 mb-4">
          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                id="job-search-input"
                type="text"
                placeholder="Search by title or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>

            {/* Sort */}
            <select
              id="job-sort-select"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="input-field w-auto pr-8 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Filters toggle */}
            <button
              type="button"
              id="toggle-filters-btn"
              onClick={() => setFiltersOpen((v) => !v)}
              className={`btn-secondary gap-2 ${filtersOpen ? 'border-brand-500 text-brand-400' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasFilters && (
                <span className="w-2 h-2 rounded-full bg-brand-400" />
              )}
            </button>

            <button id="search-jobs-btn" type="submit" className="btn-primary">
              Search
            </button>
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      id="location-filter"
                      type="text"
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="input-field pl-9"
                    />
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      id="min-salary-filter"
                      type="number"
                      placeholder="Min Salary"
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                      className="input-field pl-9"
                    />
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      id="max-salary-filter"
                      type="number"
                      placeholder="Max Salary"
                      value={maxSalary}
                      onChange={(e) => setMaxSalary(e.target.value)}
                      className="input-field pl-9"
                    />
                  </div>
                </div>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Clear all filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* No results */}
      {!loading && jobs.length === 0 && (
        <div className="glass-card p-16 text-center">
          <Briefcase className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-slate-300 font-medium mb-1">No jobs found</h3>
          <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary mt-4 text-sm">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Job Grid */}
      {!loading && jobs.length > 0 && (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
        >
          {jobs.map((job) => {
            const company = job?.postedBy?.companyName || 'Unknown Company';
            const isExpanded = expandedId === job._id;
            const applied    = appliedIds.has(job._id);
            const bookmarked = bookmarkedIds.has(job._id);

            return (
              <motion.div
                key={job._id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
                className={`glass-card flex flex-col transition-all duration-200 hover:border-brand-500/30 ${
                  isExpanded ? 'border-brand-500/40' : ''
                }`}
              >
                {/* Card header */}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{company}</span>
                      </div>
                      <h3
                        className="text-sm font-semibold text-slate-100 cursor-pointer hover:text-brand-400 transition-colors line-clamp-2"
                        onClick={() => setExpandedId(isExpanded ? null : job._id)}
                      >
                        {job.title}
                      </h3>
                    </div>
                    {/* Bookmark */}
                    <button
                      id={`bookmark-${job._id}`}
                      onClick={() => handleBookmark(job._id)}
                      disabled={bookmarked || bookmarkingId === job._id}
                      className={`p-1.5 rounded-lg border shrink-0 transition-all duration-200 ${
                        bookmarked
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                          : 'border-slate-700 text-slate-500 hover:border-amber-500/40 hover:text-amber-400 hover:bg-amber-500/10'
                      }`}
                    >
                      {bookmarkingId === job._id
                        ? <LoadingSpinner size="sm" />
                        : bookmarked
                          ? <BookmarkCheck className="w-4 h-4" />
                          : <Bookmark className="w-4 h-4" />
                      }
                    </button>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.location && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {job.location}
                      </span>
                    )}
                    {job.salary && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <DollarSign className="w-3.5 h-3.5 shrink-0" />
                        {Number(job.salary).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Expanded description */}
                  <AnimatePresence>
                    {isExpanded && job.description && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-slate-400 leading-relaxed mt-3 pt-3 border-t border-slate-800 line-clamp-6">
                          {job.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-800 flex gap-2">
                  <button
                    id={`apply-${job._id}`}
                    onClick={() => handleApply(job._id)}
                    disabled={applied || applyingId === job._id}
                    className={`flex-1 text-xs py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      applied
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                        : 'bg-brand-600 hover:bg-brand-500 text-white'
                    }`}
                  >
                    {applyingId === job._id
                      ? <LoadingSpinner size="sm" />
                      : applied
                        ? '✓ Applied'
                        : '🚀 Apply'
                    }
                  </button>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : job._id)}
                    className="text-xs py-2 px-3 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
                  >
                    {isExpanded ? 'Less' : 'More'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            id="prev-page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn-secondary py-2 px-3 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-slate-600 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      p === page
                        ? 'text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                    style={p === page ? { background: '#2550eb' } : {}}
                  >
                    {p}
                  </button>
                )
              )}
          </div>

          <button
            id="next-page-btn"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="btn-secondary py-2 px-3 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
