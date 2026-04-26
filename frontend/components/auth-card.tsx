'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authApi, setToken } from '@/lib/api';

type AuthMode = 'login' | 'signup';

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

export function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('');
  const [signupContact, setSignupContact] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  const checkPasswordRequirements = (pwd: string) => {
    const checks = {
      minLength: pwd.length >= PASSWORD_REQUIREMENTS.minLength,
      hasUppercase: PASSWORD_REQUIREMENTS.hasUppercase.test(pwd),
      hasLowercase: PASSWORD_REQUIREMENTS.hasLowercase.test(pwd),
      hasNumber: PASSWORD_REQUIREMENTS.hasNumber.test(pwd),
      hasSpecial: PASSWORD_REQUIREMENTS.hasSpecial.test(pwd),
    };
    const passedChecks = Object.values(checks).filter(Boolean).length;
    if (passedChecks <= 2) setPasswordStrength('weak');
    else if (passedChecks === 4) setPasswordStrength('medium');
    else if (passedChecks === 5) setPasswordStrength('strong');
    return checks;
  };

  const handlePasswordChange = (pwd: string) => {
    setSignupPassword(pwd);
    checkPasswordRequirements(pwd);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError('Email and password are required.');
      return;
    }
    setLoginLoading(true);
    try {
      const res = await authApi.login(loginEmail, loginPassword);
      setToken(res.token);
      router.push('/supplier/dashboard');
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    if (!signupName || !signupEmail || !signupPassword || !signupRole) {
      setSignupError('Name, email, password and role are required.');
      return;
    }
    setSignupLoading(true);
    try {
      // Signup returns no token — auto-login immediately after
      await authApi.signup({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        role: signupRole,
        contact_number: signupContact || undefined,
        address: signupAddress || undefined,
      });
      const loginRes = await authApi.login(signupEmail, signupPassword);
      setToken(loginRes.token);
      router.push('/supplier/dashboard');
    } catch (err: unknown) {
      setSignupError(err instanceof Error ? err.message : 'Signup failed.');
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <div
        className="w-full max-w-2xl rounded-xl shadow-xl overflow-hidden bg-white"
        style={{ borderColor: '#B7E4C7', borderWidth: '1px' }}
      >
        {/* Header */}
        <div className="px-12 py-8" style={{ backgroundColor: '#2D6A4F' }}>
          <h1 className="text-3xl font-bold text-center" style={{ color: '#FFFFFF' }}>
            SCM System Access
          </h1>
          <p className="text-center text-sm mt-2" style={{ color: '#D8F3DC' }}>
            Supply Chain Management Portal
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={mode} onValueChange={(value) => setMode(value as AuthMode)} className="w-full">
          <TabsList className="w-full rounded-none border-b gap-0" style={{ borderColor: '#B7E4C7', backgroundColor: '#F9F9F9' }}>
            <TabsTrigger
              value="login"
              className="flex-1 data-[state=active]:rounded-none font-semibold text-base py-4"
              style={{
                color: mode === 'login' ? '#FFFFFF' : '#74C69D',
                backgroundColor: mode === 'login' ? '#2D6A4F' : 'transparent',
                borderBottom: mode === 'login' ? '3px solid #40916C' : 'none',
              }}
            >
              Log In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="flex-1 data-[state=active]:rounded-none font-semibold text-base py-4"
              style={{
                color: mode === 'signup' ? '#FFFFFF' : '#74C69D',
                backgroundColor: mode === 'signup' ? '#2D6A4F' : 'transparent',
                borderBottom: mode === 'signup' ? '3px solid #40916C' : 'none',
              }}
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login" className="p-12 space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="login-email" style={{ color: '#081C15' }}>Email Address</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="border"
                  style={{ borderColor: '#B7E4C7', color: '#081C15' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#52B788'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#B7E4C7'; }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" style={{ color: '#081C15' }}>Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="border"
                  style={{ borderColor: '#B7E4C7', color: '#081C15' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#52B788'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#B7E4C7'; }}
                />
              </div>

              {loginError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  {loginError}
                </p>
              )}

              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full text-white font-semibold py-2"
                style={{ backgroundColor: '#2D6A4F' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#40916C'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2D6A4F'; }}
              >
                {loginLoading ? 'Logging in…' : 'Log In'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm underline transition-colors"
                  style={{ color: '#40916C' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#2D6A4F'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#40916C'; }}
                  onClick={() => setMode('signup')}
                >
                  Don&apos;t have an account? Sign Up
                </button>
              </div>
            </form>
          </TabsContent>

          {/* Sign Up Form */}
          <TabsContent value="signup" className="p-12 space-y-5">
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="signup-name" style={{ color: '#081C15' }}>Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="border"
                  style={{ borderColor: '#B7E4C7', color: '#081C15' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#52B788'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#B7E4C7'; }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" style={{ color: '#081C15' }}>Email Address</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="border"
                  style={{ borderColor: '#B7E4C7', color: '#081C15' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#52B788'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#B7E4C7'; }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" style={{ color: '#081C15' }}>Set Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  className="border"
                  style={{ borderColor: '#B7E4C7', color: '#081C15' }}
                  value={signupPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#52B788'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#B7E4C7'; }}
                />
                <p className="text-xs" style={{ color: '#52B788' }}>
                  Min 8 characters with uppercase, lowercase, number &amp; special character
                </p>
                {passwordStrength && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#D8F3DC' }}>
                      <div
                        className={`h-full rounded-full transition-all ${getPasswordStrengthColor()}`}
                        style={{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%' }}
                      />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: '#40916C' }}>
                      {passwordStrength}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-role" style={{ color: '#081C15' }}>Select Your Role</Label>
                <Select value={signupRole} onValueChange={setSignupRole}>
                  <SelectTrigger
                    id="signup-role"
                    className="border"
                    style={{ borderColor: '#B7E4C7', color: signupRole ? '#081C15' : '#52B788' }}
                  >
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="warehouse_manager">Warehouse Manager</SelectItem>
                    <SelectItem value="retailer">Retailer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-contact" style={{ color: '#081C15' }}>Contact Number</Label>
                <Input
                  id="signup-contact"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={signupContact}
                  onChange={(e) => setSignupContact(e.target.value)}
                  className="border"
                  style={{ borderColor: '#B7E4C7', color: '#081C15' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#52B788'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#B7E4C7'; }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-address" style={{ color: '#081C15' }}>Physical Address</Label>
                <Textarea
                  id="signup-address"
                  placeholder="Enter your business address"
                  className="border resize-none"
                  rows={3}
                  value={signupAddress}
                  onChange={(e) => setSignupAddress(e.target.value)}
                  style={{ borderColor: '#B7E4C7', color: '#081C15' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#52B788'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#B7E4C7'; }}
                />
              </div>

              {signupError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  {signupError}
                </p>
              )}

              <Button
                type="submit"
                disabled={signupLoading}
                className="w-full text-white font-semibold py-2"
                style={{ backgroundColor: '#2D6A4F' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#40916C'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2D6A4F'; }}
              >
                {signupLoading ? 'Creating account…' : 'Sign Up'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm underline transition-colors"
                  style={{ color: '#40916C' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#2D6A4F'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#40916C'; }}
                  onClick={() => setMode('login')}
                >
                  Already have an account? Log In
                </button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
