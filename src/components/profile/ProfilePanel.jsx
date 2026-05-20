import { CalendarDays, Link as LinkIcon, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar.jsx';

export default function ProfilePanel({ profile }) {
  if (!profile) return null;

  return (
    <section className="surface rounded-lg overflow-hidden">
      <div className="h-24 bg-[linear-gradient(135deg,#1877F2_0%,#0FA3B1_55%,#E0A526_100%)]" />
      <div className="px-5 pb-5">
        <div className="-mt-7 flex items-end justify-between gap-3">
          <Avatar profile={profile} size="lg" />
          <Link
            className="focus-ring rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            to="/settings"
          >
            Edit
          </Link>
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-black text-ink">{profile.displayName || profile.username}</h2>
          <p className="text-sm text-slate-500">@{profile.username}</p>
          {profile.bio ? <p className="mt-3 text-sm leading-6 text-slate-700">{profile.bio}</p> : null}
        </div>
        <div className="mt-4 grid gap-2 text-sm text-slate-500">
          {profile.location ? <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {profile.location}</span> : null}
          {profile.website ? <a className="flex items-center gap-2 text-brand-700" href={profile.website} rel="noreferrer" target="_blank"><LinkIcon className="h-4 w-4" /> {profile.website}</a> : null}
          <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="mt-5 grid grid-cols-3 rounded-md border border-line bg-slate-50 text-center">
          <div className="p-3">
            <p className="font-black text-ink">{profile.postsCount || 0}</p>
            <p className="text-xs font-medium text-slate-500">Posts</p>
          </div>
          <div className="border-x border-line p-3">
            <p className="font-black text-ink">{profile.followersCount || 0}</p>
            <p className="text-xs font-medium text-slate-500">Followers</p>
          </div>
          <div className="p-3">
            <p className="font-black text-ink">{profile.followingCount || 0}</p>
            <p className="text-xs font-medium text-slate-500">Following</p>
          </div>
        </div>
      </div>
    </section>
  );
}
