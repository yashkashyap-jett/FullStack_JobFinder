import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, MapPin, DollarSign, Building2, Trash2, ExternalLink } from 'lucide-react';
import { getAllBookmarksApi, deleteBookmarkApi } from '../../api/bookmark.api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CandidateBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const fetchBookmarks = () => {
    setLoading(true);
    getAllBookmarksApi()
      .then((res) => setBookmarks(res.data.bookmarks || []))
      .catch((err) => {
        // 404 = no bookmarks yet — not an error state
        if (err.response?.status !== 404) {
          toast.error(err.response?.data?.message || 'Failed to load bookmarks');
        }
        setBookmarks([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookmarks(); }, []);

  const handleRemove = async (jobId, bookmarkId) => {
    setRemovingId(bookmarkId);
    try {
      await deleteBookmarkApi(jobId);
      setBookmarks((prev) => prev.filter((b) => b._id !== bookmarkId));
      toast.success('Bookmark removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove bookmark');
    } finally {
      setRemovingId(null);
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="section-title flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-amber-400" />
            Bookmarks
          </h1>
          <p className="section-subtitle">
            {bookmarks.length > 0
              ? `${bookmarks.length} saved job${bookmarks.length !== 1 ? 's' : ''}`
              : "Jobs you've saved for later"}
          </p>
        </div>
      </motion.div>

      {/* Empty state */}
      {bookmarks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
            <Bookmark className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">No bookmarks yet</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            When you find a job you like, save it here. Browse jobs and use the bookmark button to save them for later.
          </p>
        </motion.div>
      )}

      {/* Bookmarks grid */}
      {bookmarks.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {bookmarks.map((bookmark, i) => {
              const job = bookmark.job ?? {};
              const company = job?.postedBy?.companyName || 'Unknown Company';

              return (
                <motion.div
                  key={bookmark._id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="glass-card p-5 flex flex-col justify-between gap-4 hover:border-amber-500/30 transition-all duration-200 group"
                >
                  {/* Job info */}
                  <div className="flex-1">
                    {/* Company */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{company}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
                      {job.title ?? 'Untitled Position'}
                    </h3>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-2">
                      {job.location && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                          {job.location}
                        </span>
                      )}
                      {job.salary && (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                          <DollarSign className="w-3.5 h-3.5 shrink-0" />
                          {Number(job.salary).toLocaleString()} / yr
                        </span>
                      )}
                    </div>

                    {/* Saved date */}
                    <p className="text-xs text-slate-600 mt-2">
                      Saved {new Date(bookmark.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                    <button
                      id={`remove-bookmark-${bookmark._id}`}
                      onClick={() => handleRemove(job._id, bookmark._id)}
                      disabled={removingId === bookmark._id}
                      className="btn-danger flex-1 text-xs py-2"
                    >
                      {removingId === bookmark._id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
