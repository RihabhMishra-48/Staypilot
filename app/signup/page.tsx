'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { signupAction } from '@/lib/actions/auth';
import { ActionResponse } from '@/types';
import { Hotel, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<ActionResponse | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const [formData, setFormData] = React.useState({
    fullName: '',
    initialHotelName: '',
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
    data.append('fullName', formData.fullName);
    data.append('initialHotelName', formData.initialHotelName);
    data.append('email', formData.email);
    data.append('password', formData.password);

    try {
      const res = await signupAction(null, data);
      if (res) {
        setResult(res);
        if (res.errors) {
          setFieldErrors(res.errors);
        }
      }
    } catch {
      // Catch navigation or unexpected error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-zinc-50 px-4 py-12 antialiased">
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <Link href="/dashboard" className="flex items-center gap-2.5 mb-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs group-hover:bg-blue-700 transition-colors">
            <Hotel className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">
            StayPilot
          </span>
        </Link>
        <p className="text-xs text-zinc-500 font-medium">
          Create your hotelier account and launch your digital PMS
        </p>
      </div>

      <Card className="w-full max-w-md border-zinc-200/90 shadow-sm bg-white">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-lg font-bold text-zinc-900">
            Create Hotelier Account
          </CardTitle>
          <CardDescription className="text-xs">
            Start managing rooms, channel distributions, and front desk operations.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {result && !result.success && (
            <Alert variant="error" title="Registration Error">
              {result.message}
            </Alert>
          )}

          {result && result.success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/90 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Security Verification Link Sent</span>
              </div>
              <p className="text-emerald-800 leading-relaxed">
                {result.message}
              </p>
              <p className="text-[11px] text-emerald-700 bg-emerald-100/60 p-2 rounded">
                💡 <strong>Important:</strong> Check your <strong>Spam / Junk</strong> or <strong>Promotions</strong> folder if the email does not appear in your primary inbox within a few seconds.
              </p>
              <div className="pt-1">
                <Link
                  href="/login"
                  className="inline-flex items-center font-bold text-emerald-900 underline hover:text-emerald-950"
                >
                  Go to Sign In →
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" required>
                Your Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Rishabh Sharma"
                value={formData.fullName}
                onChange={handleChange}
                error={!!fieldErrors.fullName}
                required
              />
              {fieldErrors.fullName && (
                <p className="text-[11px] text-rose-600">{fieldErrors.fullName[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="initialHotelName">
                Hotel / Establishment Name (Optional)
              </Label>
              <Input
                id="initialHotelName"
                name="initialHotelName"
                type="text"
                placeholder="e.g. Royal Grand Palace"
                value={formData.initialHotelName}
                onChange={handleChange}
                error={!!fieldErrors.initialHotelName}
              />
              <p className="text-[11px] text-zinc-400">
                You can configure complete address and policies in Property Setup.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" required>
                Work Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="gm@royalgrand.com"
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
              <Label htmlFor="password" required>
                Password (min. 8 characters)
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
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
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full text-xs font-semibold mt-2"
            >
              <span>Register &amp; Continue</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </form>

          <div className="rounded-lg bg-zinc-50 border border-zinc-200/80 p-3 text-[11px] text-zinc-500 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Multi-Tenant Architecture</span>
            </div>
            <p>
              Signing up automatically generates your profile in Supabase PostgreSQL and sets up an isolated environment protected by non-recursive RLS policies.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-0">
          <div className="text-center text-xs text-zinc-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign in to your property
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
