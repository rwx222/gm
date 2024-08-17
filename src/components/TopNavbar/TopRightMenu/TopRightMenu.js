'use client'
/* eslint-disable @next/next/no-img-element */
import { useCallback, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { initializeApp } from 'firebase/app'
import { getAuth, signOut } from 'firebase/auth'
import { isNonEmptyString } from 'ramda-adjunct'

import { PATH_AUTH, PATH_CHANGE_THEME } from '@/constants'
import firebaseConfig from '@/data/firebaseConfig'
import UserRoundIcon from '@/icons/UserRoundIcon'
import CircleUserRoundIcon from '@/icons/CircleUserRoundIcon'
import PaletteIcon from '@/icons/PaletteIcon'
import LogoutIcon from '@/icons/LogoutIcon'
import logoutAction from '@/actions/logoutAction'
import getAvatarUrlFromName from '@/utils/getAvatarUrlFromName'
import { useStore } from '@/components/ClientTasks/ClientTasks'

const USER_AVATAR_MENU_ID = 'main-user-avatar-dropdown'
const LINK_CLASSNAME = 'text-base sm:text-lg font-normal'

function BaseComponent() {
  const authRef = useRef(null)
  const router = useRouter()

  const resetAvatarData = useStore((state) => state.resetAvatarData)
  const avatarFetched = useStore((state) => state.avatarFetched)
  const avatarData = useStore((state) => state.avatarData)

  useEffect(() => {
    const app = initializeApp(firebaseConfig)
    authRef.current = getAuth(app)
  }, [])

  const logout = useCallback(async () => {
    try {
      resetAvatarData()
      await logoutAction(avatarData?.uid)
      await signOut(authRef.current)
    } catch (error) {
      console.error(error)
      console.error(`💥> LOU '${error?.message}'`)
    } finally {
      router.push(PATH_AUTH)
    }
  }, [router, avatarData?.uid, resetAvatarData])

  const closeUserAvatarMenu = useCallback(() => {
    const userAvatarMenuElement = document.getElementById(USER_AVATAR_MENU_ID)
    const activeElement = document.activeElement

    setTimeout(() => {
      activeElement?.blur()
      userAvatarMenuElement?.blur()
    }, 400)
  }, [])

  if (!avatarData) {
    if (avatarFetched) {
      return <NotLoggedUser />
    }

    return <AvatarSkeleton />
  }

  const avatarUrl = isNonEmptyString(avatarData?.photoURL)
    ? avatarData?.photoURL
    : getAvatarUrlFromName(avatarData?.displayName)

  return (
    <div
      id={USER_AVATAR_MENU_ID}
      className='dropdown dropdown-end max-w-12 max-h-12'
    >
      <div tabIndex={0} role='button' className='btn-circle avatar'>
        <div className='w-12 h-12 rounded-full border-2 border-primary'>
          <img alt='Foto de usuario' src={avatarUrl} />
        </div>
      </div>

      <ul
        tabIndex={0}
        className='menu dropdown-content bg-base-100 rounded-box z-[1] mt-1 p-1 w-72 shadow border-2 border-primary'
        onClick={closeUserAvatarMenu}
      >
        <li>
          <Link
            prefetch={false}
            href={'/u/' + avatarData?.username}
            className={LINK_CLASSNAME}
          >
            <UserRoundIcon />
            {`Perfil`}
          </Link>
        </li>

        <CustomDivider />

        <li>
          <Link href={PATH_CHANGE_THEME} className={LINK_CLASSNAME}>
            <PaletteIcon />
            {`Cambiar tema`}
          </Link>
        </li>

        <CustomDivider />

        <li>
          <button type='button' className={LINK_CLASSNAME} onClick={logout}>
            <LogoutIcon />
            {`Cerrar sesión`}
          </button>
        </li>
      </ul>
    </div>
  )
}

export default function TopRightMenu(props) {
  return (
    <Suspense fallback={<AvatarSkeleton />}>
      <BaseComponent {...props} />
    </Suspense>
  )
}

const AvatarSkeleton = () => {
  return <div className='skeleton w-12 h-12 rounded-full' />
}

const CustomDivider = () => {
  return <div className='divider my-0 h-1' />
}

const NotLoggedUser = () => {
  return (
    <Link
      href={PATH_AUTH}
      prefetch={false}
      className='btn btn-outline text-base xs:text-lg font-normal'
    >
      {`Ingresar`}

      <CircleUserRoundIcon />
    </Link>
  )
}
