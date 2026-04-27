'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/api'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    router.push(token ? '/manufacturer/dashboard' : '/login')
  }, [router])

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <p className='text-gray-600'>Redirecting...</p>
    </div>
  )
}
