'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authApi, setToken } from '@/lib/api';

type AuthMode = 'login' | 'signup';

type Props = {
  initialMode?: AuthMode;
};

const roleOptions = [
  { value: 'supplier', label: 'Supplier' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'warehouse_manager', label: 'Warehouse Manager' },
  { value: 'retailer', label: 'Retailer' },
];

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

const getPasswordStrengthColor = (passwordStrength: 'weak' | 'medium' | 'strong' | null) => {
  switch (passwordStrength) {
    case 'weak':
      return 'bg-red-400';
    case 'medium':
      return 'bg-yellow-400';
    case 'strong':
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
};

export function AuthCard({ initialMode = 'login' }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('manufacturer');
  const [signupContact, setSignupContact] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const checkPasswordRequirements = (pwd: string) => {
    const checks = {
      minLength: pwd.length >= PASSWORD_REQUIREMENTS.minLength,
      hasUppercase: PASSWORD_REQUIREMENTS.hasUppercase.test(pwd),
      hasLowercase: PASSWORD_REQUIREMENTS.hasLowercase.test(pwd),
      hasNumber: PASSWORD_REQUIREMENTS.hasNumber.test(pwd),
      hasSpecial: PASSWORD_REQUIREMENTS.hasSpecial.test(pwd),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    if (passedChecks <= 2) {
      setPasswordStrength('weak');
    } else if (passedChecks === 4) {
      setPasswordStrength('medium');
    } else if (passedChecks === 5) {
      setPasswordStrength('strong');
    } else {
      setPasswordStrength(null);
    }

    return checks;
  };

  const handlePasswordChange = (pwd: string) => {
    setSignupPassword(pwd);
    checkPasswordRequirements(pwd);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!loginEmail || !loginPassword) {
          throw new Error('Please enter both email and password.');
        }

        const response = await authApi.login(loginEmail, loginPassword);
        setToken(response.token);
        router.push('/manufacturer/dashboard');
      } else {
        if (!signupName || !signupEmail || !signupPassword || !signupRole) {
          throw new Error('Please fill in all required fields.');
        }

        const checks = checkPasswordRequirements(signupPassword);
        if (!checks.minLength || !checks.hasUppercase || !checks.hasLowercase || !checks.hasNumber || !checks.hasSpecial) {
          throw new Error('Password does not meet requirements.');
        }

        await authApi.signup({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          role: signupRole,
          contact_number: signupContact,
          address: signupAddress,
        });

        const loginResponse = await authApi.login(signupEmail, signupPassword);
        setToken(loginResponse.token);
        router.push('/manufacturer/dashboard');
      }
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as any).message)
          : 'An unexpected error occurred.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <div
        className="w-full max-w-2xl rounded-xl shadow-xl overflow-hidden bg-white"
        style={{ borderColor: '#B7E4C7', borderWidth: '1px' }}
      >
        <div className="px-12 py-8" style={{ backgroundColor: '#2D6A4F' }}>
          <h1 className="text-3xl font-bold text-center" style={{ color: '#FFFFFF' }}>
            SCM System Access
          </h1>
          <p className="text-center text-sm mt-2" style={{ color: '#D8F3DC' }}>
            Supply Chain Management Portal
          </p>
        </div>

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

          <TabsContent value="login" className="p-12 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="login-email" style={{ color: '#081C15' }}>
                  Email Address
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="border"
                  style={{ borderColor: '#B7E4C7', color: '#081C15' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" style={{ color: '#081C15' }}>
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="border"
                  style={{ borderColor: '#B7E4C7', color: '#081C15' }}
                />
              </div>

              {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

              <Button type="submit" className="w-full text-white font-semibold py-2" disabled={loading} style={{ backgroundColor: '#2D6A4F' }}>
                {loading ? 'Signing in...' : 'Log In'}
              </Button>

              <div className="text-center">
                <button type="button" className="text-sm underline transition-colors" style={{ color: '#40916C' }} onClick={() => setMode('signup')}>
                  Don't have an account? Sign Up
                </button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="p-12 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="signup-name" style={{ color: '#081C15' }}>
                  Full Name
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="border"
                  style={{ borderColor: '#B7E4C7', color: '#081C15' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" style={{ color: '#081C15' }}>
                  Email Address
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="border"
                  style={{ borderColor: '#B7E4C7', color: '#081C15' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" style={{ color: '#081C15' }}>
                  Set Password
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="border"
                  style={{ borderColor: '#B7E4C7', color: '#081C15' }}
                />
                <p className="text-xs" style={{ color: '#52B788' }}>
                  Min 8 characters with uppercase, lowercase, number & special character
                </p>
                {passwordStrength ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#D8F3DC' }}>
                      <div className={`h-full rounded-full transition-all ${getPasswordStrengthColor(passwordStrength)}`} style={{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%' }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: '#40916C' }}>
                      {passwordStrength}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-role" style={{ color: '#081C15' }}>
                  Select Your Role
                </Label>
                <Select value={signupRole} onValueChange={setSignupRole}>
                  <SelectTrigger id="signup-role" className="border" style={{ borderColor: '#B7E4C7', color: signupRole ? '#081C15' : '#52B788' }}>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-contact" style={{ color: '#081C15' }}>
                  Contact Number
                </Label>
                <Input
                  id="signup-contact"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={signupContact}
                  onChange={(e) => setSignupContact(e.target.value)}
                  className="border"
                  style={{ borderColor: '#B7E4C7', color: '#081C15' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-address" style={{ color: '#081C15' }}>
                  Physical Address
                </Label>
                <Textarea
                  id="signup-address"
                  placeholder="Enter your business address"
                  className="border resize-none"
                  rows={3}
                  value={signupAddress}
                  onChange={(e) => setSignupAddress(e.target.value)}
                  style={{ borderColor: '#B7E4C7', color: '#081C15' }}
                />
              </div>

              {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

              <Button type="submit" className="w-full text-white font-semibold py-2" disabled={loading} style={{ backgroundColor: '#2D6A4F' }}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>

              <div className="text-center">
                <button type="button" className="text-sm underline transition-colors" style={{ color: '#40916C' }} onClick={() => setMode('login')}>
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
