'use client'
import { useEffect, Suspense } from 'react'
import { themeChange } from 'theme-change'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'

import { PATH_HOME } from '@/constants'

function BaseComponent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // refresh user data after login
    const tid = searchParams.get('tid')
    if (tid && pathname === PATH_HOME) {
      router.refresh()
    }
  }, [pathname, router, searchParams])

  useEffect(() => {
    // apply saved ui theme on the first render
    themeChange(false)
  }, [])

  return null
}

export default function ClientTasks(props) {
  return (
    <Suspense>
      <BaseComponent {...props} />
    </Suspense>
  )
}
