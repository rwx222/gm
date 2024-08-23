'use client'
/* eslint-disable @next/next/no-img-element */
import { Suspense } from 'react'

const StaticAvatar = ({ srcUrl }) => {
  return (
    <div className='avatar'>
      <div className='ring-accent ring-offset-base-100 rounded-full ring ring-offset-2 w-36 xs:w-56'>
        <img alt='Foto de usuario' src={srcUrl} />
      </div>
    </div>
  )
}

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

export default function UserAvatarButton(props) {
  return (
    <Suspense fallback={<StaticAvatar srcUrl={props.srcUrl} />}>
      <BaseComponent {...props} />
    </Suspense>
  )
}
