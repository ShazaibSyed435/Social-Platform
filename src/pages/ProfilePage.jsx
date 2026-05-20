import { useParams } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { api } from '../lib/api.js';
import useAsync from '../hooks/useAsync.js';
import ProfilePanel from '../components/profile/ProfilePanel.jsx';
import PostCard from '../components/posts/PostCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProfilePage() {
  const { username } = useParams();
  const { profile: me } = useAuth();
  const { data: profile, loading, error, run } = useAsync(() => api.getProfile(username), [username]);
  const posts = useAsync(() => (profile?._id ? api.userPosts(profile._id) : Promise.resolve([])), [profile?._id], Boolean(profile?._id));

  const follow = async () => {
    await api.follow(profile._id);
    await run();
  };

  return (
    <section className="space-y-4">
      {loading ? <div className="surface rounded-lg p-6 text-sm font-medium text-slate-500">Loading profile...</div> : null}
      {error ? <EmptyState icon={UserRound} title="Profile not found" description={error} /> : null}

      {profile ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="space-y-4">
              <ProfilePanel profile={profile} />
              {profile._id !== me?._id ? (
                <Button className="w-full" onClick={follow}>Follow</Button>
              ) : null}
            </div>
            <div className="space-y-4">
              <h1 className="text-xl font-black text-ink">Posts</h1>
              {posts.loading ? <div className="surface rounded-lg p-6 text-sm font-medium text-slate-500">Loading posts...</div> : null}
              {!posts.loading && posts.data?.length === 0 ? <EmptyState title="No posts yet" /> : null}
              {posts.data?.map((post) => <PostCard key={post._id} post={post} onChanged={posts.run} />)}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
