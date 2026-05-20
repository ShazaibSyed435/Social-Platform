import { Bell, Compass, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import ProfilePanel from './ProfilePanel.jsx';

export default function RightRail() {
  const { profile } = useAuth();

  return (
    <aside className="hidden space-y-4 xl:block">
      <ProfilePanel profile={profile} />
      <section className="surface rounded-lg p-5">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-500">Status</h2>
        <div className="mt-4 grid gap-3">
          <div className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
            <Compass className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-sm font-bold text-ink">Explore is public</p>
              <p className="text-xs text-slate-500">Hashtag discovery uses live posts.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
            <Bell className="h-5 w-5 text-gold" />
            <div>
              <p className="text-sm font-bold text-ink">Notifications active</p>
              <p className="text-xs text-slate-500">Likes, follows, mentions, reposts.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
            <MessageSquare className="h-5 w-5 text-teal" />
            <div>
              <p className="text-sm font-bold text-ink">Chat ready</p>
              <p className="text-xs text-slate-500">Create threads from profile ids.</p>
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}
