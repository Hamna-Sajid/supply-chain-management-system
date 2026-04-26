'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi, setToken } from '@/lib/api';

type AuthMode = 'login' | 'signup';

const roleOptions = [
  { value: 'manufacturer', label: 'Manufacturer' },
];

export function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('manufacturer');
  const [signupContact, setSignupContact] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }
    setLoginLoading(true);
    try {
      const res = await authApi.login(loginEmail, loginPassword);
      setToken(res.token);
      router.push('/manufacturer/dashboard');
    } catch (err: any) {
      setLoginError(err.response?.data?.error || err.message || 'Login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    if (!signupName || !signupEmail || !signupPassword || !signupRole) {
      setSignupError('Please fill in all required fields.');
      return;
    }
    setSignupLoading(true);
    try {
      await authApi.signup({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        role: signupRole,
        contact_number: signupContact || undefined,
        address: signupAddress || undefined,
      });
      // Signup successful, auto-login to get token
      const loginRes = await authApi.login(signupEmail, signupPassword);
      setToken(loginRes.token);
      router.push('/manufacturer/dashboard');
    } catch (err: any) {
      setSignupError(err.response?.data?.error || err.message || 'Signup failed.');
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="w-full max-w-2xl rounded-xl shadow-xl overflow-hidden bg-white" style={{ borderColor: '#B7E4C7', borderWidth: '1px' }}>
        <div className="px-12 py-8" style={{ backgroundColor: '#2D6A4F' }}>
          <h1 className="text-3xl font-bold text-center" style={{ color: '#FFFFFF' }}>SCM System Access</h1>
          <p className="text-center text-sm mt-2" style={{ color: '#D8F3DC' }}>Supply Chain Management Portal</p>
        </div>

        <div className="flex w-full border-b" style={{ borderColor: '#B7E4C7', backgroundColor: '#F9F9F9' }}>
          <button 
            className={`flex-1 font-semibold text-base py-4 transition-colors ${mode === 'login' ? 'border-b-4' : ''}`}
            style={{
              color: mode === 'login' ? '#FFFFFF' : '#74C69D',
              backgroundColor: mode === 'login' ? '#2D6A4F' : 'transparent',
              borderColor: '#40916C',
            }}
            onClick={() => setMode('login')}
          >
            Log In
          </button>
          <button 
            className={`flex-1 font-semibold text-base py-4 transition-colors ${mode === 'signup' ? 'border-b-4' : ''}`}
            style={{
              color: mode === 'signup' ? '#FFFFFF' : '#74C69D',
              backgroundColor: mode === 'signup' ? '#2D6A4F' : 'transparent',
              borderColor: '#40916C',
            }}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        {mode === 'login' && (
          <div className="p-12 space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{loginError}</div>}
              
              <div className="space-y-2">
                <Label htmlFor="login-email">Email Address</Label>
                <Input id="login-email" type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              </div>

              <Button type="submit" disabled={loginLoading} className="w-full text-white font-semibold py-2" style={{ backgroundColor: '#2D6A4F' }}>
                {loginLoading ? 'Logging In...' : 'Log In'}
              </Button>
            </form>
          </div>
        )}

        {mode === 'signup' && (
          <div className="p-12 space-y-5">
            <form onSubmit={handleSignup} className="space-y-5">
              {signupError && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{signupError}</div>}

              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name *</Label>
                <Input id="signup-name" type="text" placeholder="John Doe" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email Address *</Label>
                <Input id="signup-email" type="email" placeholder="you@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Set Password *</Label>
                <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-role">Select Your Role *</Label>
                <select 
                  id="signup-role"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={signupRole} 
                  onChange={(e) => setSignupRole(e.target.value)}
                >
                  <option value="" disabled>Choose a role</option>
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-contact">Contact Number</Label>
                <Input id="signup-contact" type="tel" placeholder="+1 (555) 123-4567" value={signupContact} onChange={(e) => setSignupContact(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-address">Physical Address</Label>
                <textarea 
                  id="signup-address" 
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                  placeholder="Enter your business address" 
                  rows={3} 
                  value={signupAddress} 
                  onChange={(e) => setSignupAddress(e.target.value)} 
                />
              </div>

              <Button type="submit" disabled={signupLoading} className="w-full text-white font-semibold py-2" style={{ backgroundColor: '#2D6A4F' }}>
                {signupLoading ? 'Signing Up...' : 'Sign Up'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
