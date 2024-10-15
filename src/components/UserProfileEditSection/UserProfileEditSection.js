'use client'
import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

import { useStore } from '@/components/ClientTasks/ClientTasks'
import { PATH_EDIT_PROFILE, SS_KEY_SAVED_USER_PROFILE } from '@/constants'

function BaseComponent({ urlUsername }) {
  const avatarData = useStore((s) => s.avatarData)

  useEffect(() => {
    const savedUserFlag = sessionStorage.getItem(SS_KEY_SAVED_USER_PROFILE)
    sessionStorage.removeItem(SS_KEY_SAVED_USER_PROFILE)

    if (savedUserFlag) {
      toast.success('Cambios guardados', {
        duration: 5000,
        className: '!bg-success !text-success-content',
        icon: '✅',
      })
    }
  }, [])

  if (avatarData?.username && avatarData?.username === urlUsername) {
    return (
      <section className='pb-3 text-center'>
        <Link
          href={PATH_EDIT_PROFILE}
          className='btn btn-neutral btn-wide text-lg font-medium'
        >
          {`Editar`}
        </Link>
      </section>
    )
  }

  return null
}

export default function UserProfileEditSection(props) {
  return (
    <Suspense>
      <BaseComponent {...props} />
    </Suspense>
  )
}
