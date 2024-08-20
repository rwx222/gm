'use client'
import { useEffect, Suspense } from 'react'
import { create } from 'zustand'
import { themeChange } from 'theme-change'
import { usePathname, useSearchParams } from 'next/navigation'

import getAvatarDataAction from '@/actions/getAvatarDataAction'
import { PATH_HOME, EVENT_REFRESH_AVATAR_DATA } from '@/constants'

export const useStore = create((set) => ({
  avatarFetched: false,
  avatarData: null,
  updateAvatarData: (newData) => {
    set({ avatarData: newData })
  },
  resetAvatarData: () => {
    set({ avatarData: null })
  },
  updateAvatarFetched: (newData) => {
    set({ avatarFetched: Boolean(newData) })
  },
}))

function BaseComponent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateAvatarFetched = useStore((state) => state.updateAvatarFetched)
  const updateAvatarData = useStore((state) => state.updateAvatarData)

  useEffect(() => {
    // apply saved ui theme on the first render
    themeChange(false)
  }, [])

  useEffect(() => {
    function refreshAvatarData() {
      updateAvatarFetched(false)
      getAvatarDataAction()
        .then((avatarData) => {
          updateAvatarData(avatarData)
        })
        .catch((error) => {
          console.error(error)
          console.error(`💥> UAD '${error?.message}'`)
        })
        .finally(() => {
          updateAvatarFetched(true)
        })
    }
    window.addEventListener(EVENT_REFRESH_AVATAR_DATA, refreshAvatarData)

    refreshAvatarData()

    return () => {
      window.removeEventListener(EVENT_REFRESH_AVATAR_DATA, refreshAvatarData)
    }
  }, [updateAvatarData, updateAvatarFetched])

  useEffect(() => {
    // refresh avatar data after login
    const tid = searchParams.get('tid')
    if (tid && pathname === PATH_HOME) {
      window.dispatchEvent(new CustomEvent(EVENT_REFRESH_AVATAR_DATA))
    }
  }, [pathname, searchParams])

  return null
}

export default function ClientTasks(props) {
  return (
    <Suspense>
      <BaseComponent {...props} />
    </Suspense>
  )
}
