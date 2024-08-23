/* eslint-disable @next/next/no-img-element */
import { notFound } from 'next/navigation'
import { isNonEmptyString } from 'ramda-adjunct'
import classNames from 'classnames'

import getAllUsersData from '@/data/getAllUsersData'
import getUserDataFromUsername from '@/data/getUserDataFromUsername'
import getAvatarUrlFromName from '@/utils/getAvatarUrlFromName'
import UserProfileEditSection from '@/components/UserProfileEditSection/UserProfileEditSection'
import UserAvatarButton from '@/components/UserAvatarButton/UserAvatarButton'
import XIcon from '@/icons/XIcon'
import FaTiktokIcon from '@/icons/FaTiktokIcon'
import FaInstagramIcon from '@/icons/FaInstagramIcon'
import FaXIcon from '@/icons/FaXIcon'
import FaSnapchatIcon from '@/icons/FaSnapchatIcon'
import FaYoutubeIcon from '@/icons/FaYoutubeIcon'
import FaFacebookIcon from '@/icons/FaFacebookIcon'
import {
  SN_TIKTOK_USER_LINK,
  SN_INSTAGRAM_USER_LINK,
  SN_X_USER_LINK,
  SN_SNAPCHAT_USER_LINK,
  SN_YOUTUBE_USER_LINK,
  SN_FACEBOOK_USER_LINK,
} from '@/constants'

export const dynamic = 'force-static'

export const dynamicParams = true

export async function generateStaticParams() {
  const usersData = await getAllUsersData()
  return usersData.map((user) => ({ username: user.username }))
}

export async function generateMetadata({ params }) {
  const userData = await getUserDataFromUsername(params.username)

  return {
    title: `Perfil de ${userData?.displayName || params.username}`,
  }
}

const MODAL_ID_USER_PHOTO_VIEW = 'user_photo_view_modal_id'

export default async function U({ params }) {
  const userData = await getUserDataFromUsername(params.username)

  if (!userData) {
    notFound()
  }

  const isThereAnySnLink =
    isNonEmptyString(userData?.snUserTiktok) ||
    isNonEmptyString(userData?.snUserInstagram) ||
    isNonEmptyString(userData?.snUserXcom) ||
    isNonEmptyString(userData?.snUserSnapchat) ||
    isNonEmptyString(userData?.snUserYoutube) ||
    isNonEmptyString(userData?.snUserFacebook)

  const avatarUrl = isNonEmptyString(userData?.photoURL)
    ? userData?.photoURL
    : getAvatarUrlFromName(userData?.displayName)

  return (
    <main className='px-5'>
      <section className='flex justify-center pt-3 pb-5'>
        <UserAvatarButton
          srcUrl={avatarUrl}
          modalId={MODAL_ID_USER_PHOTO_VIEW}
        />
      </section>

      <section className='pb-3'>
        <h1 className='text-xl sm:text-3xl font-semibold text-center text-accent'>
          {userData?.displayName}
        </h1>

        <p className='text-center text-accent text-lg sm:text-2xl font-normal'>
          {params.username}
        </p>
      </section>

      <UserProfileEditSection urlUsername={params.username} />

      <div
        className={classNames('pb-10 md:pt-6', {
          'md:grid md:grid-cols-2': isThereAnySnLink,
        })}
      >
        <section className='w-full max-w-96 mx-auto'>
          <SkillItem value={20}>
            <SkillLabel>{`Técnica: 20`}</SkillLabel>
          </SkillItem>

          <SkillItem value={85} className='progress-primary'>
            <SkillLabel className='text-primary'>{`Musicalidad: 85`}</SkillLabel>
          </SkillItem>

          <SkillItem value={100} className='progress-info'>
            <SkillLabel className='text-info'>{`Dificultad: 100`}</SkillLabel>
          </SkillItem>

          <SkillItem value={90} className='progress-warning'>
            <SkillLabel className='text-warning'>{`Coreografía: 90`}</SkillLabel>
          </SkillItem>

          <SkillItem value={70} className='progress-error'>
            <SkillLabel className='text-error'>{`Sincronización: 70`}</SkillLabel>
          </SkillItem>

          <SkillItem value={55} className='progress-success'>
            <SkillLabel className='text-success'>{`Estilo: 55`}</SkillLabel>
          </SkillItem>

          <SkillItem value={40} className='progress-secondary'>
            <SkillLabel className='text-secondary'>{`Expresión: 40`}</SkillLabel>
          </SkillItem>
        </section>

        {isThereAnySnLink && (
          <section className='w-full max-w-96 mx-auto md:pl-5'>
            <div className='divider md:hidden' />

            {userData?.snUserTiktok && (
              <SocialNetworkLink
                href={SN_TIKTOK_USER_LINK + userData?.snUserTiktok}
                icon={<FaTiktokIcon height='20' />}
              >
                {`@${userData?.snUserTiktok}`}
              </SocialNetworkLink>
            )}

            {userData?.snUserInstagram && (
              <SocialNetworkLink
                href={SN_INSTAGRAM_USER_LINK + userData?.snUserInstagram}
                icon={<FaInstagramIcon height='20' />}
              >
                {`@${userData?.snUserInstagram}`}
              </SocialNetworkLink>
            )}

            {userData?.snUserXcom && (
              <SocialNetworkLink
                href={SN_X_USER_LINK + userData?.snUserXcom}
                icon={<FaXIcon width='20' />}
              >
                {`@${userData?.snUserXcom}`}
              </SocialNetworkLink>
            )}

            {userData?.snUserSnapchat && (
              <SocialNetworkLink
                href={SN_SNAPCHAT_USER_LINK + userData?.snUserSnapchat}
                icon={<FaSnapchatIcon width='20' />}
              >
                {`@${userData?.snUserSnapchat}`}
              </SocialNetworkLink>
            )}

            {userData?.snUserYoutube && (
              <SocialNetworkLink
                href={SN_YOUTUBE_USER_LINK + userData?.snUserYoutube}
                icon={<FaYoutubeIcon width='20' />}
              >
                {`@${userData?.snUserYoutube}`}
              </SocialNetworkLink>
            )}

            {userData?.snUserFacebook && (
              <SocialNetworkLink
                href={SN_FACEBOOK_USER_LINK + userData?.snUserFacebook}
                icon={<FaFacebookIcon height='20' />}
              >
                {`@${userData?.snUserFacebook}`}
              </SocialNetworkLink>
            )}
          </section>
        )}
      </div>

      <div>
        <dialog id={MODAL_ID_USER_PHOTO_VIEW} className='modal'>
          <div className='relative'>
            <form method='dialog'>
              <button className='btn btn-neutral btn-sm btn-circle absolute right-2 top-2'>
                <XIcon width={24} height={24} />
              </button>
            </form>
            <img
              src={avatarUrl}
              alt='Foto de usuario'
              className='w-[300px] xs:w-[360px] sm:w-[400px]'
            />
          </div>
        </dialog>
      </div>
    </main>
  )
}

const SkillLabel = ({ children, className }) => {
  return (
    <div
      className={`mb-[-6px] text-base sm:text-lg leading-none sm:leading-none ${
        className ?? ''
      }`}
    >
      {children}
    </div>
  )
}

const SkillItem = ({ children, value, className }) => {
  return (
    <div className='pt-2'>
      {children}
      <progress
        value={value}
        max='100'
        className={`w-full progress ${className ?? ''}`}
      />
    </div>
  )
}

const SocialNetworkLink = ({ href, children, icon }) => {
  return (
    <div className='py-2 flex justify-center'>
      <a href={href} target='_blank' className='flex gap-2 text-accent'>
        {icon && (
          <span className='grow-0 flex-shrink-0 basis-[20px] flex items-center justify-end'>
            {icon}
          </span>
        )}
        {children}
      </a>
    </div>
  )
}
