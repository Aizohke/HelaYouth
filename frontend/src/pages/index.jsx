import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Coins, Clock, Mail, ArrowLeft, Home } from 'lucide-react';

// ─── Sign In ──────────────────────────────────────────────────────────────────
export function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="mb-6 text-center">
        <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow">
          <Coins className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-stone-900">Welcome back</h1>
        <p className="text-stone-500 text-sm mt-1">Sign in to your Hela Youth account</p>
      </div>
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        afterSignInUrl="/"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'shadow-lg border border-stone-200 rounded-2xl',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
          },
        }}
      />
    </div>
  );
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────
export function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="mb-6 text-center">
        <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow">
          <Coins className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-stone-900">Join the Club</h1>
        <p className="text-stone-500 text-sm mt-1">Create your Hela Youth account</p>
      </div>
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        afterSignUpUrl="/"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'shadow-lg border border-stone-200 rounded-2xl',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
          },
        }}
      />
    </div>
  );
}

// ─── Pending Approval ─────────────────────────────────────────────────────────
export function PendingApproval() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-stone-900 mb-3">Application Under Review</h1>
        <p className="text-stone-600 text-sm leading-relaxed mb-5">
          Thank you for registering with Hela Youth Self Help Group. Your application is currently being reviewed by our administrators.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left space-y-2">
          <p className="text-sm font-semibold text-amber-800">What happens next?</p>
          <ul className="text-xs text-amber-700 space-y-1.5">
            <li className="flex items-start gap-2"><span className="mt-0.5">•</span> An admin will review your application within 2–3 business days</li>
            <li className="flex items-start gap-2"><span className="mt-0.5">•</span> You will be notified via email once approved</li>
            <li className="flex items-start gap-2"><span className="mt-0.5">•</span> Upon approval, you'll gain full access to the member portal</li>
          </ul>
        </div>
        <div className="flex gap-3">
          <Link to="/" className="btn-secondary flex-1 justify-center text-sm">
            <Home className="w-4 h-4" /> Home
          </Link>
          <a href="mailto:info@helayouth.org" className="btn-primary flex-1 justify-center text-sm">
            <Mail className="w-4 h-4" /> Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Not Found ────────────────────────────────────────────────────────────────
export function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-mono text-8xl font-bold text-brand-200 mb-4">404</p>
        <h1 className="font-display text-2xl font-bold text-stone-900 mb-2">Page Not Found</h1>
        <p className="text-stone-500 text-sm mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}

export default SignInPage;
