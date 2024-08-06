import Link from 'next/link'
import { Suspense } from 'react'

import LoggedUser, {
  AvatarSkeleton,
} from '@/components/TopNavbar/LoggedUser/LoggedUser'
import MenuIcon from '@/icons/MenuIcon'

export default function TopNavbar() {
  return (
    <div className='navbar bg-base-100'>
      <div className='flex-none xl:hidden'>
        <label
          htmlFor='main-layout-drawer'
          className='btn btn-square btn-ghost'
        >
          <MenuIcon />
        </label>
      </div>

      <div className='flex-1'>
        <Link
          href='/home'
          className='text-lg xs:text-xl sm:text-2xl ml-2 xs:ml-3 font-medium'
        >
          {`GameMaster`}
        </Link>
      </div>

      <div className='flex-none'>
        <Suspense fallback={<AvatarSkeleton />}>
          <LoggedUser />
        </Suspense>
      </div>
    </div>
  )
}
