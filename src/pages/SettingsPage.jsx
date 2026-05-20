import { Save } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import Toast from '../components/ui/Toast.jsx';

export default function SettingsPage() {
  const { profile, setProfile } = useAuth();
  const [form, setForm] = useState({
    username: profile?.username || '',
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    avatar: profile?.avatar || '',
    location: profile?.location || '',
    website: profile?.website || '',
    isPrivate: Boolean(profile?.isPrivate),
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const updated = await api.updateMe(form);
      setProfile(updated);
      localStorage.setItem('profile', JSON.stringify(updated));
      setToast({ type: 'success', message: 'Profile updated.' });
    } catch (err) {
      setToast({ type: 'error', message: err.errors?.join(', ') || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl space-y-4">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div>
        <h1 className="text-2xl font-black text-ink">Settings</h1>
        <p className="text-sm text-slate-500">Update your public profile and privacy.</p>
      </div>

      <form className="surface grid gap-4 rounded-lg p-5" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Username" value={form.username} onChange={(event) => setField('username', event.target.value)} />
          <Input label="Display name" value={form.displayName} onChange={(event) => setField('displayName', event.target.value)} />
        </div>
        <Textarea label="Bio" maxLength={160} value={form.bio} onChange={(event) => setField('bio', event.target.value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Avatar URL" value={form.avatar} onChange={(event) => setField('avatar', event.target.value)} />
          <Input label="Location" value={form.location} onChange={(event) => setField('location', event.target.value)} />
        </div>
        <Input label="Website" value={form.website} onChange={(event) => setField('website', event.target.value)} />
        <label className="flex items-center justify-between rounded-md border border-line bg-slate-50 p-3">
          <span>
            <span className="block text-sm font-bold text-ink">Private profile</span>
            <span className="block text-xs text-slate-500">New follow requests stay pending.</span>
          </span>
          <input
            checked={form.isPrivate}
            onChange={(event) => setField('isPrivate', event.target.checked)}
            type="checkbox"
            className="h-5 w-5 rounded border-line text-brand-600"
          />
        </label>
        <div className="flex justify-end">
          <Button loading={loading} type="submit">
            <Save className="h-4 w-4" />
            Save changes
          </Button>
        </div>
      </form>
    </section>
  );
}
