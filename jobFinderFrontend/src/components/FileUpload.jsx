import { useCallback, useState } from 'react';
import { Upload, FileCheck, X, AlertCircle } from 'lucide-react';

/**
 * FileUpload — drag-and-drop file input with preview of filename.
 * @param {function} onFile - called with the File object
 * @param {string[]} accept - MIME types e.g. ['application/pdf','image/*']
 * @param {string} label
 * @param {string} hint
 */
export default function FileUpload({ onFile, accept = [], label = 'Upload File', hint = '' }) {
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (accept.length > 0) {
      const ok = accept.some((a) => {
        if (a.endsWith('/*')) {
          return file.type.startsWith(a.replace('/*', '/'));
        }
        return file.type === a;
      });
      if (!ok) {
        setError(`Unsupported file type: ${file.type}`);
        return;
      }
    }
    setError('');
    setSelected(file);
    onFile?.(file);
  }, [accept, onFile]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const onInputChange = (e) => handleFile(e.target.files[0]);

  const clear = () => {
    setSelected(null);
    setError('');
    onFile?.(null);
  };

  return (
    <div className="space-y-2">
      <p className="input-label">{label}</p>

      <label
        className={`
          flex flex-col items-center justify-center gap-3 p-8 rounded-xl
          border-2 border-dashed cursor-pointer transition-all duration-200
          ${dragging
            ? 'border-brand-500 bg-brand-500/5'
            : 'border-surface-700 hover:border-brand-500/50 hover:bg-surface-800/40 bg-surface-800/20'
          }
        `}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          type="file"
          className="sr-only"
          accept={accept.join(',')}
          onChange={onInputChange}
        />

        {selected ? (
          <div className="flex items-center gap-2 text-emerald-400">
            <FileCheck className="w-6 h-6 shrink-0" />
            <span className="text-sm font-medium truncate max-w-xs">{selected.name}</span>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); clear(); }}
              className="ml-1 text-slate-400 hover:text-red-400 transition-colors"
            >
              <X className="w-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className={`w-8 h-8 ${dragging ? 'text-brand-400' : 'text-slate-500'}`} />
            <div className="text-center">
              <p className="text-sm text-slate-300">
                Drag & drop or <span className="text-brand-400 font-medium">browse</span>
              </p>
              {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
            </div>
          </>
        )}
      </label>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}
