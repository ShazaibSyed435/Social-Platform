import { Bell, CheckCheck, Radio, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { api } from '../lib/api.js';
import useAsync from '../hooks/useAsync.js';
import { useSocket } from '../context/SocketContext.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

const formatDate = (value) => new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date(value));

export default function NotificationsPage() {
  const { data: notifications, setData, loading, error, run } = useAsync(() => api.notifications({ limit: 50 }), []);
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (!socket) return undefined;

    const addNotification = (notification) => {
      setData((current = []) => {
        if (current.some((item) => item._id === notification._id)) return current;
        return [notification, ...current];
      });
    };

    const updateRead = (notification) => {
      setData((current = []) => current.map((item) => (item._id === notification._id ? notification : item)));
    };

    const updateAllRead = () => {
      setData((current = []) => current.map((item) => ({ ...item, isRead: true })));
    };

    socket.on('notification:new', addNotification);
    socket.on('notification:read', updateRead);
    socket.on('notification:read-all', updateAllRead);

    return () => {
      socket.off('notification:new', addNotification);
      socket.off('notification:read', updateRead);
      socket.off('notification:read-all', updateAllRead);
    };
  }, [socket, setData]);

  const markOne = async (id) => {
    const updated = await api.markNotificationRead(id);
    setData((current = []) => current.map((item) => (item._id === id ? updated : item)));
  };

  const markAll = async () => {
    await api.markAllNotificationsRead();
    setData((current = []) => current.map((item) => ({ ...item, isRead: true })));
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink">Notifications</h1>
          <p className="flex items-center gap-2 text-sm text-slate-500">
            Activity from your social graph.
            <span className={`inline-flex items-center gap-1 font-semibold ${connected ? 'text-emerald-600' : 'text-slate-400'}`}>
              <Radio className="h-3.5 w-3.5" />
              {connected ? 'Live' : 'Offline'}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={run} variant="secondary">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={markAll}>
            <CheckCheck className="h-4 w-4" />
            Read all
          </Button>
        </div>
      </div>

      {loading ? <div className="surface rounded-lg p-6 text-sm font-medium text-slate-500">Loading notifications...</div> : null}
      {error ? <EmptyState icon={Bell} title="Notifications could not load" description={error} /> : null}
      {!loading && !error && notifications?.length === 0 ? <EmptyState icon={Bell} title="No notifications" description="Likes, follows, mentions, and reposts will appear here." /> : null}

      <div className="space-y-3">
        {notifications?.map((notification) => (
          <article
            key={notification._id}
            className={`surface flex items-start gap-3 rounded-lg p-4 ${notification.isRead ? 'opacity-75' : 'ring-1 ring-brand-100'}`}
          >
            <Avatar profile={notification.sender} />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-6 text-slate-700">
                <span className="font-bold text-ink">@{notification.sender?.username}</span>{' '}
                {notification.message || notification.type}
              </p>
              <p className="text-xs font-medium text-slate-400">{formatDate(notification.createdAt)}</p>
            </div>
            {!notification.isRead ? (
              <Button onClick={() => markOne(notification._id)} size="sm" variant="secondary">Read</Button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
