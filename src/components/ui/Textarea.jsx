export default function Textarea({ label, error, className = '', ...props }) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span> : null}
      <textarea
        className={`focus-ring min-h-28 w-full resize-none rounded-md border border-line bg-white px-3 py-3 text-sm text-ink placeholder:text-slate-400 ${className}`}
        {...props}
      />
      {error ? <span className="mt-2 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}
