'use client'
import { useEffect, useCallback, Suspense } from 'react'
import { create } from 'zustand'
import { themeChange } from 'theme-change'
import { usePathname, useSearchParams } from 'next/navigation'

import getAvatarDataAction from '@/actions/getAvatarDataAction'
import { PATH_HOME } from '@/constants'

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

  const getUserAvatarData = useCallback(() => {
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
  }, [updateAvatarData, updateAvatarFetched])

  useEffect(() => {
    // refresh avatar data after login
    const tid = searchParams.get('tid')
    if (tid && pathname === PATH_HOME) {
      getUserAvatarData()
    }
  }, [pathname, searchParams, getUserAvatarData])

  useEffect(() => {
    // apply saved ui theme on the first render
    themeChange(false)
    getUserAvatarData()
  }, [getUserAvatarData])

  return null
}

export default function ClientTasks(props) {
  return (
    <Suspense>
      <BaseComponent {...props} />
    </Suspense>
  )
}
