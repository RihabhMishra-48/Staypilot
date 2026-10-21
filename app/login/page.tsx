'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { loginAction } from '@/lib/actions/auth';
import { ActionResponse } from '@/types';
import { Hotel, ArrowRight, ShieldCheck, Database, KeyRound } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramRedirect = searchParams.get('redirectTo');
  
  const [loginMode, setLoginMode] = React.useState<'hotel' | 'admin'>(
    paramRedirect?.startsWith('/platform-admin') ? 'admin' : 'hotel'
  );

  const redirectTo =
    paramRedirect ||
    (loginMode === 'admin' ? '/platform-admin/dashboard' : '/hotel/dashboard');

  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<ActionResponse | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setFieldErrors({});

    const data = new FormData();
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('redirectTo', redirectTo);

    try {
      const res = await loginAction(null, data);
      if (res) {
        setResult(res);
        if (res.errors) {
          setFieldErrors(res.errors);
        }
      }
    } catch {
      // If Next.js redirect happens, this block catches it or allows navigation
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-zinc-50 px-4 py-12 antialiased">
      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <Link href="/hotel/dashboard" className="flex items-center gap-2.5 mb-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs group-hover:bg-blue-700 transition-colors">
            <Hotel className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">
            StayPilot
          </span>
        </Link>
        <p className="text-xs text-zinc-500 font-medium">
          Hotel Channel Manager &amp; PMS Platform
        </p>
      </div>

      <Card className="w-full max-w-md border-zinc-200/90 shadow-sm bg-white overflow-hidden">
        {/* Portal Mode Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-zinc-100 border-b border-zinc-200/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setLoginMode('hotel');
              setResult(null);
            }}
            className={`py-2 rounded-md transition-all ${
              loginMode === 'hotel'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Hotel Application
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('admin');
              setResult(null);
            }}
            className={`py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              loginMode === 'admin'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>Super Admin</span>
          </button>
        </div>

        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-zinc-900">
              {loginMode === 'admin'
                ? 'StayPilot Super Admin'
                : 'Hotel Property Sign In'}
            </CardTitle>
            {loginMode === 'admin' ? (
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-500/20 uppercase tracking-wider">
                Operator Only
              </span>
            ) : (
              <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                Hotel Staff
              </span>
            )}
          </div>
          <CardDescription className="text-xs">
            {loginMode === 'admin'
              ? 'Sign in with platform operator credentials to access tenant accounts, subscriptions, and sync monitoring.'
              : 'Enter your work email and password to access your hotel PMS and channel manager.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {result && !result.success && (
            <Alert variant="error" title="Sign In Error">
              {result.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" required>
                {loginMode === 'admin' ? 'Operator Email' : 'Work Email Address'}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={loginMode === 'admin' ? 'admin@staypilot.com' : 'generalmanager@hotel.com'}
                value={formData.email}
                onChange={handleChange}
                error={!!fieldErrors.email}
                required
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-600">{fieldErrors.email[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" required>
                  Password
                </Label>
                <span className="text-[11px] text-blue-600 hover:text-blue-700 cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                error={!!fieldErrors.password}
                required
              />
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-600">{fieldErrors.password[0]}</p>
              )}
            </div>

            <Button
              type="submit"
              variant={loginMode === 'admin' ? 'secondary' : 'primary'}
              size="lg"
              isLoading={isLoading}
              className={`w-full text-xs font-semibold ${
                loginMode === 'admin' ? 'bg-zinc-900 text-white hover:bg-zinc-800' : ''
              }`}
            >
              <span>{loginMode === 'admin' ? 'Sign In to Super Admin' : 'Sign In to StayPilot'}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </form>

          {loginMode === 'admin' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-[11px] text-amber-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                Super Admin Privilege Requirement
              </p>
              <p className="text-amber-800 text-[10px] leading-relaxed">
                Platform operator accounts must have <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">is_platform_admin = true</code> in your Supabase <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">public.profiles</code> table.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-0">
          <div className="text-center text-xs text-zinc-500">
            Don&apos;t have a property account?{' '}
            <Link
              href="/signup"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Register your establishment
            </Link>
          </div>

          <div className="text-[11px] text-zinc-400 text-center flex items-center justify-center gap-3 border-t border-zinc-100 pt-3">
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              Supabase Auth
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <KeyRound className="h-3 w-3" />
              Cookie-based Sessions
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50">
          <div className="text-xs text-zinc-500">Loading StayPilot...</div>
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
