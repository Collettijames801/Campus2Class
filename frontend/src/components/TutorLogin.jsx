import { useState } from 'react';
import { tutorLogin } from '../lib/api';

export default function TutorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await tutorLogin(email, password);
      localStorage.setItem('tutorToken', result.token);
      window.location.href = '/tutor-dashboard';
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] px-6 py-12">
      <form onSubmit={submit} className="w-full max-w-md rounded-md border border-[var(--color-line)] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-brass-dark)]">Campus2Class</p>
        <h1 className="mt-3 font-display text-3xl text-[var(--color-ink)]">Tutor login</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">Manage your schedule and see upcoming sessions.</p>
        {error && <p className="mt-5 rounded-sm bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <label className="mt-6 block text-sm font-medium text-[var(--color-ink-soft)]">
          Email
          <input className="field mt-1" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="mt-4 block text-sm font-medium text-[var(--color-ink-soft)]">
          Password
          <input className="field mt-1" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="mt-6 w-full rounded-sm bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}