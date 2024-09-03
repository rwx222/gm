'use client'
import { Suspense } from 'react'

function BaseComponent({ srcUrl, modalId }) {
  return (
    <button
      type='button'
      className='avatar cursor-pointer'
      onClick={() => {
        document.getElementById(modalId).showModal()
      }}
    >
      <div className='ring-accent ring-offset-base-100 rounded-full ring ring-offset-2 w-36 xs:w-56'>
        <img alt='Foto de usuario' src={srcUrl} />
      </div>
    </button>
  )
}

const StaticAvatar = ({ srcUrl }) => {
  return (
    <div className='avatar'>
      <div className='ring-accent ring-offset-base-100 rounded-full ring ring-offset-2 w-36 xs:w-56'>
        <img alt='Foto de usuario' src={srcUrl} />
      </div>
    </div>
  )
}

export default function UserAvatarButton(props) {
  return (
    <Suspense fallback={<StaticAvatar srcUrl={props.srcUrl} />}>
      <BaseComponent {...props} />
    </Suspense>
  )
}
