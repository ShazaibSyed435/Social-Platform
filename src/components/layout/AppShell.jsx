import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Compass,
  Home,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  User,
} from 'lucide-react';
import Avatar from '../ui/Avatar.jsx';
import Button from '../ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';

const navItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Explore', path: '/explore', icon: Compass },
  { label: 'Messages', path: '/messages', icon: MessageSquare },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export default function AppShell() {
  const { profile, signOut } = useAuth();
  const { connected } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-mist">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-line bg-white px-5 py-6 lg:block">
        <button
          className="mb-8 flex items-center gap-3 text-left"
          onClick={() => navigate('/')}
          type="button"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-600 text-lg font-black text-white">
            S
          </div>
          <div>
            <p className="text-lg font-black text-ink">Social Hub</p>
            <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
              @{profile?.username}
              <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            </p>
          </div>
        </button>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                className={`focus-ring flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
                  active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
                }`}
                onClick={() => navigate(item.path)}
                type="button"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-5 right-5">
          <button
            className="mb-4 flex w-full items-center gap-3 rounded-md border border-line bg-slate-50 p-3 text-left"
            onClick={() => navigate(`/profile/${profile?.username}`)}
            type="button"
          >
            <Avatar profile={profile} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{profile?.displayName || profile?.username}</p>
              <p className="truncate text-xs text-slate-500">@{profile?.username}</p>
            </div>
          </button>
          <Button className="w-full" onClick={signOut} variant="secondary">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-line bg-white/95 px-4 py-3 backdrop-blur lg:ml-72 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="focus-ring h-10 w-full rounded-md border border-line bg-slate-50 pl-10 pr-3 text-sm"
              placeholder="Search usernames, tags, or conversations"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && event.currentTarget.value.trim()) {
                  navigate(`/explore?hashtag=${encodeURIComponent(event.currentTarget.value.replace(/^#/, '').trim())}`);
                  event.currentTarget.value = '';
                }
              }}
            />
          </div>
          <button
            className="focus-ring rounded-full lg:hidden"
            onClick={() => navigate(`/profile/${profile?.username}`)}
            type="button"
          >
            <Avatar profile={profile} />
          </button>
        </div>
      </header>

      <main className="px-4 py-6 lg:ml-72 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-line bg-white lg:hidden">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              className={`flex h-14 items-center justify-center ${active ? 'text-brand-700' : 'text-slate-500'}`}
              onClick={() => navigate(item.path)}
              type="button"
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
