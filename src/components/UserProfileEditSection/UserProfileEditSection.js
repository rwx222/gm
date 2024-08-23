'use client'
import { Suspense } from 'react'
import Link from 'next/link'

import { useStore } from '@/components/ClientTasks/ClientTasks'
import { PATH_EDIT_PROFILE } from '@/constants'

function BaseComponent({ urlUsername }) {
  const avatarData = useStore((state) => state.avatarData)

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
