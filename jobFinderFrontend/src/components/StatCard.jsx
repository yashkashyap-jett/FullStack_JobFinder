import { motion } from 'framer-motion';

/**
 * StatCard — animated dashboard stat card with icon and optional trend.
 */
export default function StatCard({ icon: Icon, label, value, color = 'blue', delay = 0 }) {
  const colorMap = {
    blue: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-6 flex items-start gap-4 hover:border-surface-700 transition-colors duration-200"
    >
      <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-100 mt-1 tabular-nums">{value ?? 0}</p>
      </div>
    </motion.div>
  );
}
