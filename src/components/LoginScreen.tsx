import React, { useState } from 'react';
import { Sparkles, Shield, Brain, CheckCircle2, Laptop, ArrowRight, HelpCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, signInGuestMode, authError, clearAuthError } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    clearAuthError();
    try {
      await signInWithGoogle();
    } catch {
      // Handled in context
    } finally {
      setSigningIn(false);
    }
  };

  const isUnauthorizedDomain = authError && authError.includes('auth/unauthorized-domain');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* App Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Athena</h1>
          <p className="text-sm text-slate-400 font-medium">
            Personal AI Second Brain & Cognitive Copilot
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-1">Welcome to Your Second Brain</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sign in to unlock your private, personalized knowledge vault, tailored task rankings, and contextual AI assistant.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Private & Isolated Storage</p>
                <p className="text-[11px] text-slate-400">Your study notes, habits, and tasks belong strictly to your personal account.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <Brain className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Adaptive Long-Term Memory</p>
                <p className="text-[11px] text-slate-400">Athena learns your exam dates, subject weaknesses, and preferred focus hours.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Personalized Task ML Ranking</p>
                <p className="text-[11px] text-slate-400">Tasks dynamically weighted by deadline urgency, topic decay, and energy level.</p>
              </div>
            </div>
          </div>

          {/* Detailed Domain Error Guidance */}
          {isUnauthorizedDomain && (
            <div className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2.5">
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Localhost Not in Firebase Authorized Domains</span>
                </span>
                <button
                  onClick={clearAuthError}
                  className="text-[10px] text-amber-400 hover:text-amber-200 underline ml-2"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Google OAuth requires <code className="bg-amber-950/80 px-1.5 py-0.5 rounded text-amber-300 font-mono font-bold">localhost</code> to be whitelisted in your Firebase Console:
              </p>
              <ol className="text-[11px] text-amber-200/85 list-decimal list-inside space-y-1 pl-1">
                <li>Open <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-sky-300 underline font-semibold inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3 inline" /></a></li>
                <li>Go to <strong>Authentication &rarr; Settings &rarr; Authorized domains</strong></li>
                <li>Click <strong>Add domain</strong> and enter <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-300 font-mono">localhost</code></li>
              </ol>
              <p className="text-[11px] text-amber-300/80 pt-1 border-t border-amber-500/20">
                Or click the button below to continue immediately without cloud sync in <strong>Local Development Mode</strong>!
              </p>
            </div>
          )}

          {/* Standard Error Message (if not unauthorized-domain) */}
          {authError && !isUnauthorizedDomain && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
              <span>{authError}</span>
              <button
                onClick={clearAuthError}
                className="text-xs text-rose-400 hover:text-rose-200 underline ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Sign In Button */}
          <button
            id="google-signin-btn"
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-900 font-semibold text-sm transition-all duration-150 shadow-md shadow-white/5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {signingIn ? (
              <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{signingIn ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>

          {/* Local Development Mode Button */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <button
              id="guest-signin-btn"
              onClick={signInGuestMode}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-slate-700/60 font-semibold text-xs transition-all active:scale-[0.99]"
            >
              <Laptop className="w-4 h-4 text-sky-400" />
              <span>Continue in Local Development Mode</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-70" />
            </button>
            <p className="mt-2 text-center text-[10px] text-slate-500">
              Ideal for VS Code testing: access all Athena Second Brain features without Firebase config
            </p>
          </div>

          <p className="mt-4 text-center text-[11px] text-slate-500">
            Powered by Firebase Authentication & Google Cloud
          </p>
        </div>
      </div>
    </div>
  );
};
