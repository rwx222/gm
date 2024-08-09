'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, Suspense } from 'react'
import classNames from 'classnames'

import { PATH_HOME } from '@/constants'
import CloseIcon from '@/icons/CloseIcon'
import HomeIcon from '@/icons/HomeIcon'

function BaseComponent() {
  const pathname = usePathname()

  const toggleDrawer = useCallback(() => {
    const drawer = document.getElementById('main-layout-drawer')
    drawer.checked = !drawer.checked
  }, [])

  return (
    <ul className='menu bg-base-200 text-base-content min-h-full w-80 p-4'>
      <li className='flex flex-row justify-end mb-3'>
        <label
          htmlFor='main-layout-drawer'
          className='btn btn-circle btn-ghost sm:hidden'
        >
          <CloseIcon />
        </label>
      </li>

      <li>
        <Link
          href={PATH_HOME}
          onClick={toggleDrawer}
          className={classNames('text-xl font-normal', {
            active: pathname === PATH_HOME,
          })}
        >
          <HomeIcon />
          {`Inicio`}
        </Link>
      </li>
    </ul>
  )
}

export default function SidebarMenuList(props) {
  return (
    <Suspense>
      <BaseComponent {...props} />
    </Suspense>
  )
}
