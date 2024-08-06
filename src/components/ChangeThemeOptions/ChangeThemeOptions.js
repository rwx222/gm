'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { themeChange } from 'theme-change'
import classNames from 'classnames'

import MonitorCogIcon from '@/icons/MonitorCogIcon'
import SunIcon from '@/icons/SunIcon'
import MoonIcon from '@/icons/MoonIcon'
import SdCardMiniIcon from '@/icons/SdCardMiniIcon'

function BaseComponent() {
  const [selectedTheme, setSelectedTheme] = useState(null)

  const changeTheme = useCallback((themeId) => {
    setSelectedTheme(themeId)
  }, [])

  useEffect(() => {
    const firstLoadTheme = localStorage?.getItem('theme') ?? ''
    themeChange(false)
    setSelectedTheme(firstLoadTheme)
  }, [])

  return (
    <section className='max-w-md mx-auto sm:pt-6'>
      <div className='px-1 py-3'>
        <ThemeButton
          id=''
          currentTheme={selectedTheme}
          changeTheme={changeTheme}
        >
          <MonitorCogIcon />
          {`Tema del sistema`}
        </ThemeButton>

        <ThemeButton
          id='emerald'
          currentTheme={selectedTheme}
          changeTheme={changeTheme}
        >
          <SunIcon />
          {`Light`}
        </ThemeButton>

        <ThemeButton
          id='dim'
          currentTheme={selectedTheme}
          changeTheme={changeTheme}
        >
          <MoonIcon />
          {`Dark`}
        </ThemeButton>

        <ThemeButton
          id='cyberpunk'
          currentTheme={selectedTheme}
          changeTheme={changeTheme}
        >
          <SdCardMiniIcon />
          {`Cyberpunk`}
        </ThemeButton>
      </div>
    </section>
  )
}

const ThemeButton = ({ children, id, changeTheme, currentTheme }) => {
  const selectedClass = currentTheme === id ? 'btn-primary' : 'btn-neutral'

  return (
    <div className='pb-3'>
      <button
        type='button'
        data-set-theme={id}
        data-act-class='btn-active'
        onClick={() => changeTheme(id)}
        className={classNames(
          'btn btn-sm btn-block text-lg font-normal',
          selectedClass
        )}
      >
        {children}
      </button>
    </div>
  )
}

export default function ChangeThemeOptions(props) {
  return (
    <Suspense>
      <BaseComponent {...props} />
    </Suspense>
  )
}
