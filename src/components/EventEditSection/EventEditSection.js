'use client'
import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

import { useStore } from '@/components/ClientTasks/ClientTasks'
import { FN_PATH_EDIT_EVENT, SS_KEY_SAVED_EVENT } from '@/constants'

function BaseComponent({ eventUid, ownerUid }) {
  const avatarData = useStore((state) => state.avatarData)

  useEffect(() => {
    const savedEventFlag = sessionStorage.getItem(SS_KEY_SAVED_EVENT)
    sessionStorage.removeItem(SS_KEY_SAVED_EVENT)

    if (savedEventFlag) {
      toast.success('Cambios guardados', {
        duration: 5000,
        className: '!bg-success !text-success-content',
        icon: '✅',
      })
    }
  }, [])

  if (avatarData?.uid && avatarData?.uid === ownerUid) {
    return (
      <section className='pb-3 text-center'>
        <Link
          href={FN_PATH_EDIT_EVENT(eventUid)}
          className='btn btn-neutral btn-wide text-lg font-medium'
        >
          {`Editar`}
        </Link>
      </section>
    )
  }

  return null
}

export default function EventEditSection(props) {
  return (
    <Suspense>
      <BaseComponent {...props} />
    </Suspense>
  )
}
