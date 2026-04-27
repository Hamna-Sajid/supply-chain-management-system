'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, setToken } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault()

        if (!email || !password) {
            toast({ title: 'Please fill required information first' })
            return
        }

        setIsLoading(true)
        try {
            const result = await authApi.login(email, password)
            setToken(result.token)
            toast({ title: 'Login successful', description: 'Redirecting to dashboard...' })
            router.push('/manufacturer/dashboard')
        } catch (error: unknown) {
            toast({
                title: 'Login failed',
                description: error instanceof Error ? error.message : 'Invalid credentials',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4'>
            <Card className='w-full max-w-md shadow-lg'>
                <CardHeader>
                    <CardTitle className='text-2xl font-bold text-[#2D6A4F]'>Login</CardTitle>
                    <CardDescription>Sign in to your manufacturer account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className='space-y-4'>
                        <div>
                            <label className='mb-1 block text-sm font-medium text-gray-700'>Email</label>
                            <Input
                                type='email'
                                placeholder='your@email.com'
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className='mb-1 block text-sm font-medium text-gray-700'>Password</label>
                            <Input
                                type='password'
                                placeholder='••••••••'
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <Button type='submit' className='w-full bg-[#2D6A4F] text-white hover:bg-[#1f4637]' disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>

                    <div className='mt-4 text-center'>
                        <p className='text-sm text-gray-600'>
                            Don't have an account?{' '}
                            <a href='/register' className='font-medium text-[#2D6A4F] hover:underline'>
                                Register here
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}