import { useState } from 'react';
import { AtSign, Lock, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function AuthPage() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(form, mode);
    } catch (err) {
      setError(err.errors?.join(', ') || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-mist lg:grid-cols-[1fr_540px]">
      <section className="hidden border-r border-line bg-white p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-600 text-lg font-black text-white">
            S
          </div>
          <div>
            <p className="text-lg font-black text-ink">Social Hub</p>
            <p className="text-sm font-medium text-slate-500">Professional social workspace</p>
          </div>
        </div>
        <div className="max-w-2xl">
          <h1 className="text-5xl font-black leading-tight text-ink">Connect, post, chat, and keep the work moving.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            A focused frontend wired to your Express API for auth, profiles, feeds, posts, messaging, and notifications.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm font-semibold text-slate-600">
          <div className="rounded-md border border-line bg-slate-50 p-4">Auth</div>
          <div className="rounded-md border border-line bg-slate-50 p-4">Feeds</div>
          <div className="rounded-md border border-line bg-slate-50 p-4">Chat</div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <form className="surface w-full max-w-md rounded-lg p-6" onSubmit={submit}>
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-700">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </p>
            <h2 className="mt-2 text-3xl font-black text-ink">
              {mode === 'login' ? 'Login to Social Hub' : 'Join Social Hub'}
            </h2>
          </div>

          <div className="grid gap-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder={mode === 'register' ? '8 chars, uppercase, number, symbol' : 'Your password'}
              required
            />
          </div>

          {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}

          <Button className="mt-6 w-full" loading={loading} type="submit" size="lg">
            {mode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {mode === 'login' ? 'Login' : 'Create account'}
          </Button>

          <button
            className="focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            type="button"
          >
            {mode === 'login' ? <AtSign className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
          </button>
        </form>
      </section>
    </main>
  );
}
