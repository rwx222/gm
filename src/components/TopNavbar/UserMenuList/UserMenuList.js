'use client'
import { useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { PATH_AUTH, PATH_CHANGE_THEME } from '@/constants'
import logoutAction from '@/actions/logoutAction'
import PaletteIcon from '@/icons/PaletteIcon'
import LogoutIcon from '@/icons/LogoutIcon'

function BaseComponent({ userUid }) {
  const router = useRouter()

  const logout = useCallback(async () => {
    await logoutAction(userUid)
    router.push(PATH_AUTH)
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
