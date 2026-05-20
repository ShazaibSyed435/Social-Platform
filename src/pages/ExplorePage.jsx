import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import useAsync from '../hooks/useAsync.js';
import PostCard from '../components/posts/PostCard.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const [tag, setTag] = useState(params.get('hashtag') || '');
  const activeTag = params.get('hashtag') || '';
  const query = useMemo(() => ({ limit: 40, hashtag: activeTag }), [activeTag]);
  const { data: posts, loading, error, run } = useAsync(() => api.exploreFeed(query), [activeTag]);

  const submit = (event) => {
    event.preventDefault();
    setParams(tag.trim() ? { hashtag: tag.replace(/^#/, '').trim() } : {});
  };

  return (
    <section className="space-y-4">
      <div className="surface rounded-lg p-5">
        <h1 className="text-2xl font-black text-ink">Explore</h1>
        <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
          <Input
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            placeholder="Search by hashtag"
            className="h-10"
          />
          <Button type="submit">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </form>
      </div>

      {loading ? <div className="surface rounded-lg p-6 text-sm font-medium text-slate-500">Loading explore...</div> : null}
      {error ? <EmptyState title="Explore could not load" description={error} action={<Button onClick={run} variant="secondary">Retry</Button>} /> : null}
      {!loading && !error && posts?.length === 0 ? <EmptyState title="No public posts found" description="Try a different hashtag or create a public post." /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {posts?.map((post) => <PostCard key={post._id} post={post} onChanged={run} />)}
      </div>
    </section>
  );
}
