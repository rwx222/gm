import Link from 'next/link'

import { PATH_HOME } from '@/constants'
import TopRightMenu from '@/components/TopNavbar/TopRightMenu/TopRightMenu'
import MenuIcon from '@/icons/MenuIcon'

export default function TopNavbar() {
  return (
    <div className='navbar bg-base-100 xl:border-b xl:border-primary pr-5'>
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
          href={PATH_HOME}
          className='text-lg xs:text-xl sm:text-2xl ml-2 xs:ml-3 font-medium'
        >
          {`GameMaster`}
        </Link>
      </div>

      <div className='flex-none'>
        <TopRightMenu />
      </div>
    </div>
  )
}
