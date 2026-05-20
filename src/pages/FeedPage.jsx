import { RefreshCw, Radio, WifiOff } from 'lucide-react';
import { useEffect } from 'react';
import { api } from '../lib/api.js';
import useAsync from '../hooks/useAsync.js';
import { useSocket } from '../context/SocketContext.jsx';
import PostComposer from '../components/posts/PostComposer.jsx';
import PostCard from '../components/posts/PostCard.jsx';
import RightRail from '../components/profile/RightRail.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Button from '../components/ui/Button.jsx';

export default function FeedPage() {
  const { data: posts, setData: setPosts, loading, error, run } = useAsync(() => api.homeFeed({ limit: 30 }), []);
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (!socket) return undefined;

    const addPost = (post) => {
      setPosts((current = []) => {
        if (current.some((item) => item._id === post._id)) return current;
        return [post, ...current];
      });
    };

    const updatePost = (post) => {
      setPosts((current = []) => current.map((item) => (item._id === post._id ? post : item)));
    };

    const deletePost = ({ postId }) => {
      setPosts((current = []) => current.filter((item) => item._id !== postId));
    };

    const updateLike = ({ postId, likesCount }) => {
      setPosts((current = []) => current.map((item) => (
        item._id === postId ? { ...item, likesCount } : item
      )));
    };

    socket.on('post:new', addPost);
    socket.on('post:updated', updatePost);
    socket.on('post:deleted', deletePost);
    socket.on('post:liked', updateLike);

    return () => {
      socket.off('post:new', addPost);
      socket.off('post:updated', updatePost);
      socket.off('post:deleted', deletePost);
      socket.off('post:liked', updateLike);
    };
  }, [socket, setPosts]);

  const removePost = (id) => {
    setPosts((current = []) => current.filter((post) => post._id !== id));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-ink">Home Feed</h1>
            <p className="flex items-center gap-2 text-sm text-slate-500">
              Posts from you and accepted follows.
              <span className={`inline-flex items-center gap-1 font-semibold ${connected ? 'text-emerald-600' : 'text-slate-400'}`}>
                <Radio className="h-3.5 w-3.5" />
                {connected ? 'Live' : 'Offline'}
              </span>
            </p>
          </div>
          <Button onClick={() => run()} variant="secondary">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <PostComposer onCreated={(post) => setPosts((current = []) => [post, ...current])} />

        {error ? (
          <EmptyState
            icon={WifiOff}
            title="Feed could not load"
            description={error}
            action={<Button onClick={() => run()} variant="secondary">Retry</Button>}
          />
        ) : null}

        {loading ? <div className="surface rounded-lg p-6 text-sm font-medium text-slate-500">Loading feed...</div> : null}

        {!loading && !error && posts?.length === 0 ? (
          <EmptyState title="No posts yet" description="Create a post or follow people to build your feed." />
        ) : null}

        <div className="space-y-4">
          {posts?.map((post) => (
            <PostCard key={post._id} post={post} onChanged={run} onDeleted={removePost} />
          ))}
        </div>
      </section>
      <RightRail />
    </div>
  );
}
