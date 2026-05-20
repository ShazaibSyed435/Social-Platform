export default function Avatar({ profile, size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
  };

  const label = profile?.displayName || profile?.username || 'User';
  const initials = label
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (profile?.avatar) {
    return (
      <img
        src={profile.avatar}
        alt={label}
        className={`${sizes[size]} rounded-full object-cover ring-1 ring-line`}
      />
    );
  }

  return (
    <div className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 ring-1 ring-line`}>
      {initials}
    </div>
  );
}
