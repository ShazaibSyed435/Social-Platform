import { Heart, MessageCircle, MoreHorizontal, Repeat2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Avatar from '../ui/Avatar.jsx';
import Button from '../ui/Button.jsx';

const formatDate = (value) => new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date(value));

export default function PostCard({ post, onDeleted, onChanged }) {
  const { profile } = useAuth();
  const [busy, setBusy] = useState('');
  const isMine = post.author?._id === profile?._id;

  const runAction = async (key, fn) => {
    setBusy(key);
    try {
      await fn();
      onChanged?.();
    } finally {
      setBusy('');
    }
  };

  return (
    <article className="surface rounded-lg p-4">
      {post.repostOf ? (
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-teal">
          <Repeat2 className="h-4 w-4" />
          Repost
        </div>
      ) : null}
      <div className="flex gap-3">
        <Link to={`/profile/${post.author?.username}`}>
          <Avatar profile={post.author} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link className="truncate text-sm font-bold text-ink hover:text-brand-700" to={`/profile/${post.author?.username}`}>
                {post.author?.displayName || post.author?.username || 'Unknown user'}
              </Link>
              <p className="text-xs text-slate-500">
                @{post.author?.username} · {formatDate(post.createdAt)}
              </p>
            </div>
            <MoreHorizontal className="h-5 w-5 shrink-0 text-slate-400" />
          </div>

          {post.content ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{post.content}</p> : null}

          {post.media?.length ? (
            <div className="mt-3 overflow-hidden rounded-md border border-line bg-slate-100">
              <img src={post.media[0].url} alt="" className="max-h-96 w-full object-cover" />
            </div>
          ) : null}

          {post.repostOf ? (
            <div className="mt-3 rounded-md border border-line bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-500">@{post.repostOf.author?.username}</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{post.repostOf.content || 'Original post'}</p>
            </div>
          ) : null}

          {post.hashtags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.hashtags.map((tag) => (
                <Link key={tag} className="rounded-md bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700" to={`/explore?hashtag=${tag}`}>
                  #{tag}
                </Link>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              disabled={busy === 'like'}
              onClick={() => runAction('like', () => api.likePost(post._id))}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Heart className="h-4 w-4" />
              {post.likesCount || 0}
            </Button>
            <Button size="sm" type="button" variant="ghost">
              <MessageCircle className="h-4 w-4" />
              {post.repliesCount || 0}
            </Button>
            <Button
              disabled={busy === 'repost'}
              onClick={() => runAction('repost', () => api.repost(post._id))}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Repeat2 className="h-4 w-4" />
              {post.repostsCount || 0}
            </Button>
            {isMine ? (
              <Button
                className="ml-auto"
                disabled={busy === 'delete'}
                onClick={() => runAction('delete', async () => {
                  await api.deletePost(post._id);
                  onDeleted?.(post._id);
                })}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
