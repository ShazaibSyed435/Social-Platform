export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="surface rounded-lg p-8 text-center">
      {Icon ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
