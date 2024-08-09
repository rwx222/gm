/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

import { isNonEmptyString } from 'ramda-adjunct'

import UserMenuList from '@/components/TopNavbar/UserMenuList/UserMenuList'
import CircleUserRoundIcon from '@/icons/CircleUserRoundIcon'
import { PATH_AUTH } from '@/constants'
import getUserData from '@/data/getUserData'

export const AvatarSkeleton = () => {
  return <div className='skeleton w-12 h-12 rounded-full' />
}

export default async function LoggedUser() {
  const userData = await getUserData()

  if (!userData) {
    return <NotLoggedUser />
  }

  const avatarUrl = isNonEmptyString(userData.photoURL)
    ? userData.photoURL
    : getNameAvatarUrl(userData.displayName ?? 'Anonymous')

  return (
    <div
      id='main-user-avatar-dropdown'
      className='dropdown dropdown-end max-w-12 max-h-12'
    >
      <div tabIndex={0} role='button' className='btn-circle avatar'>
        <div className='w-12 h-12 rounded-full border-2 border-primary'>
          <img alt='Foto de usuario' src={avatarUrl} />
        </div>
      </div>

      <UserMenuList userUid={userData.uid} />
    </div>
  )
}

const getNameAvatarUrl = (name) => {
  const nameUri = encodeURIComponent(name)
  return `https://ui-avatars.com/api/?background=09090b&color=dca54c&name=${nameUri}`
}

const NotLoggedUser = () => {
  return (
    <Link
      href={PATH_AUTH}
      className='btn btn-outline text-base xs:text-lg font-normal'
    >
      {`Ingresar`}

      <CircleUserRoundIcon />
    </Link>
  )
}
