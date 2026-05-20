import { Image, Lock, Send, Users } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../lib/api.js';
import Button from '../ui/Button.jsx';
import Textarea from '../ui/Textarea.jsx';
import Avatar from '../ui/Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function PostComposer({ onCreated, replyTo = null }) {
  const { profile, refreshProfile } = useAuth();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [mediaUrl, setMediaUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (!content.trim() && !replyTo) return;

    setSubmitting(true);
    setError('');

    try {
      const post = await api.createPost({
        content: content.trim(),
        visibility,
        replyTo,
        media: mediaUrl.trim() ? [{ url: mediaUrl.trim(), type: 'image' }] : [],
      });
      setContent('');
      setMediaUrl('');
      await refreshProfile().catch(() => {});
      onCreated?.(post);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="surface rounded-lg p-4" onSubmit={submit}>
      <div className="flex gap-3">
        <Avatar profile={profile} />
        <div className="min-w-0 flex-1">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={280}
            placeholder="Share a thought, mention @someone, or add #topics"
            className="min-h-24 border-0 bg-slate-50"
          />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <label className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold text-slate-600">
                <Image className="h-4 w-4" />
                <input
                  value={mediaUrl}
                  onChange={(event) => setMediaUrl(event.target.value)}
                  placeholder="Image URL"
                  className="w-36 bg-transparent outline-none placeholder:text-slate-400 sm:w-56"
                />
              </label>
              <select
                className="focus-ring h-9 rounded-md border border-line bg-white px-3 text-sm font-semibold text-slate-600"
                value={visibility}
                onChange={(event) => setVisibility(event.target.value)}
              >
                <option value="public">Public</option>
                <option value="followers">Followers</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="text-xs font-medium text-slate-400">{content.length}/280</span>
              <Button loading={submitting} type="submit">
                <Send className="h-4 w-4" />
                Post
              </Button>
            </div>
          </div>
          {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-teal" /> Follow graph</span>
        <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5 text-gold" /> Privacy</span>
        <span className="truncate text-right text-slate-400">Live API</span>
      </div>
    </form>
  );
}
