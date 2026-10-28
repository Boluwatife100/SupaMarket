import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, errorMessage } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Reveal from '../components/Reveal';

export default function Login() {
  const { token, login } = useAuth();
  const location = useLocation();
  const from = location.state?.from ?? '/';

  const [mode, setMode] = useState('login'); // login | register
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to={from} replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const register = mode === 'register';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const body = register ? form : { email: form.email, password: form.password };
      const { data } = await api.post(register ? '/auth/register' : '/auth/login', body);
      login(data); // the token now exists, so the <Navigate> above sends the user onward
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  const tab = (value, label) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === value}
      onClick={() => { setMode(value); setError(''); }}
      className={`h-[38px] cursor-pointer rounded-full border-0 font-semibold transition-all duration-500 ease-expo-out ${
        mode === value ? 'bg-mint text-ink' : 'bg-transparent text-moss'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="grid min-h-[calc(100vh-190px)] place-items-center">
      <Reveal className="w-full max-w-[440px]">
        <section className="card p-6 sm:p-9">
          <h1 className="mb-1.5 text-[32px] font-bold">{register ? 'Create your account' : 'Welcome back'}</h1>
          <p className="mb-6 text-mist">Sign in to manage your cart and orders.</p>

          <div role="tablist" className="mb-6 grid grid-cols-2 gap-1.5 rounded-full border border-moss/25 bg-white/50 p-[5px]">
            {tab('login', 'Sign in')}
            {tab('register', 'Create account')}
          </div>

          <form onSubmit={submit} noValidate>
            {register && (
              <div className="mb-4">
                <label htmlFor="name" className="mb-1.5 block text-sm text-mist">Name</label>
                <input id="name" className="field w-full" value={form.name} onChange={set('name')} maxLength={60} autoComplete="name" />
              </div>
            )}
            <div className="mb-4">
              <label htmlFor="email" className="mb-1.5 block text-sm text-mist">Email</label>
              <input id="email" type="email" className="field w-full" value={form.email} onChange={set('email')} autoComplete="email" />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="mb-1.5 block text-sm text-mist">Password</label>
              <input
                id="password" type="password" className="field w-full" value={form.password} onChange={set('password')}
                maxLength={72} autoComplete={register ? 'new-password' : 'current-password'}
              />
            </div>
            <p role="alert" className="mb-3 min-h-5 text-sm text-danger">{error}</p>
            <button type="submit" disabled={busy} className="btn-primary h-[52px] w-full text-base">
              {busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}
            </button>
          </form>
        </section>
      </Reveal>
    </div>
  );
}
