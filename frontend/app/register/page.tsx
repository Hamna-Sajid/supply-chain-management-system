'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, setToken } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        contact_number: '',
        address: '',
    })

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target
        setFormData((previous) => ({ ...previous, [name]: value }))
    }

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault()

        if (!formData.name || !formData.email || !formData.password) {
            toast({ title: 'Please fill required information first' })
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast({ title: 'Passwords do not match' })
            return
        }

        setIsLoading(true)
        try {
            await authApi.signup({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'manufacturer',
                contact_number: formData.contact_number || undefined,
                address: formData.address || undefined,
            })

            const loginResult = await authApi.login(formData.email, formData.password)
            setToken(loginResult.token)

            toast({ title: 'Registration successful', description: 'Redirecting to dashboard...' })
            router.push('/manufacturer/dashboard')
        } catch (error: unknown) {
            toast({
                title: 'Registration failed',
                description: error instanceof Error ? error.message : 'Something went wrong',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4'>
            <Card className='w-full max-w-md shadow-lg'>
                <CardHeader>
                    <CardTitle className='text-2xl font-bold text-[#2D6A4F]'>Register</CardTitle>
                    <CardDescription>Create a manufacturer account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className='max-h-[70vh] space-y-4 overflow-y-auto pr-2'>
                        <div>
                            <label className='mb-1 block text-sm font-medium text-gray-700'>Full Name *</label>
                            <Input
                                type='text'
                                name='name'
                                placeholder='John Doe'
                                value={formData.name}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className='mb-1 block text-sm font-medium text-gray-700'>Email *</label>
                            <Input
                                type='email'
                                name='email'
                                placeholder='your@email.com'
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className='mb-1 block text-sm font-medium text-gray-700'>Password *</label>
                            <Input
                                type='password'
                                name='password'
                                placeholder='••••••••'
                                value={formData.password}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className='mb-1 block text-sm font-medium text-gray-700'>Confirm Password *</label>
                            <Input
                                type='password'
                                name='confirmPassword'
                                placeholder='••••••••'
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className='mb-1 block text-sm font-medium text-gray-700'>Contact Number</label>
                            <Input
                                type='tel'
                                name='contact_number'
                                placeholder='+1 (555) 000-0000'
                                value={formData.contact_number}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className='mb-1 block text-sm font-medium text-gray-700'>Address</label>
                            <textarea
                                name='address'
                                placeholder='Your address'
                                value={formData.address}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]'
                                rows={2}
                            />
                        </div>

                        <Button type='submit' className='w-full bg-[#2D6A4F] text-white hover:bg-[#1f4637]' disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'Register'}
                        </Button>
                    </form>

                    <div className='mt-4 text-center'>
                        <p className='text-sm text-gray-600'>
                            Already have an account?{' '}
                            <a href='/login' className='font-medium text-[#2D6A4F] hover:underline'>
                                Login here
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}