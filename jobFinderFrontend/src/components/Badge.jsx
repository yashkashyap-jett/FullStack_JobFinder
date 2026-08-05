/**
 * Badge — status chip with preset variants matching the backend enum values.
 */
const variants = {
  applied:  'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  accepted: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
  candidate:'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  recruiter:'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  new:      'bg-brand-500/10 text-brand-400 border border-brand-500/20',
};

const dots = {
  applied:  'bg-blue-400',
  accepted: 'bg-emerald-400',
  rejected: 'bg-red-400',
};

export default function Badge({ variant = 'applied', children, dot = false }) {
  const cls = variants[variant] ?? 'bg-surface-700 text-slate-400 border border-surface-600';
  const dotCls = dots[variant];

  return (
    <span className={`badge ${cls}`}>
      {dot && dotCls && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotCls}`} />
      )}
      {children ?? variant.charAt(0).toUpperCase() + variant.slice(1)}
    </span>
  );
}
