'use client'
import { useCallback, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { initializeApp } from 'firebase/app'
import { getAuth, signOut } from 'firebase/auth'

import { PATH_AUTH, PATH_CHANGE_THEME } from '@/constants'
import firebaseConfig from '@/data/firebaseConfig'
import logoutAction from '@/actions/logoutAction'
import PaletteIcon from '@/icons/PaletteIcon'
import LogoutIcon from '@/icons/LogoutIcon'

function BaseComponent({ userUid }) {
  const authRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const app = initializeApp(firebaseConfig)
    authRef.current = getAuth(app)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutAction(userUid)
      await signOut(authRef.current)
    } catch (error) {
      console.error(error)
      console.error(`💥> LOU '${error?.message}'`)
    } finally {
      router.push(PATH_AUTH)
    }
  }, [router, userUid])

  const closeUserAvatarMenu = useCallback(() => {
    const userAvatarMenuElement = document.getElementById(
      'main-user-avatar-dropdown'
    )
    const activeElement = document.activeElement

    setTimeout(() => {
      activeElement?.blur()
      userAvatarMenuElement?.blur()
    }, 400)
  }, [])

  return (
    <ul
      tabIndex={0}
      className='menu dropdown-content bg-base-100 rounded-box z-[1] mt-1 p-1 w-72 shadow border-2 border-primary'
      onClick={closeUserAvatarMenu}
    >
      <li>
        <Link
          href={PATH_CHANGE_THEME}
          className='text-base sm:text-lg font-normal'
        >
          <PaletteIcon />
          {`Cambiar tema`}
        </Link>
      </li>

      <CustomDivider />

      <li>
        <button
          type='button'
          className='text-base sm:text-lg font-normal'
          onClick={logout}
        >
          <LogoutIcon />
          {`Cerrar sesión`}
        </button>
      </li>
    </ul>
  )
}

export default function UserMenuList(props) {
  return (
    <Suspense>
      <BaseComponent {...props} />
    </Suspense>
  )
}

const CustomDivider = () => {
  return <div className='divider my-0 h-1' />
}
