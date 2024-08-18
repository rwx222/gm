'use client'
/* eslint-disable @next/next/no-img-element */
import { Suspense, useCallback, useState, useEffect } from 'react'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import classNames from 'classnames'
import { isNonEmptyString } from 'ramda-adjunct'

import {
  PATH_HOME,
  PATH_AUTH,
  PATH_FORGOT_PASSWORD,
  CSRF_TOKEN_NAME,
  PROVIDER_ID_GOOGLE,
  PROVIDER_ID_FACEBOOK,
  REGEX_USER_PHONE,
  REGEX_USER_USERNAME,
  REGEX_USER_PASSWORD,
  ERROR_CODE_INVALID_CSRF,
  ERROR_CODE_RECAPTCHA_LOW_SCORE,
  ERROR_CODE_EMAIL_ALREADY_IN_USE,
  ERROR_CODE_INVALID_CREDENTIAL,
  ERROR_CODE_POPUP_CLOSED,
  ERROR_CODE_TOO_MANY_REQUESTS,
  FIELD_PHONE_MIN_LENGTH,
  FIELD_PHONE_MAX_LENGTH,
  FIELD_EMAIL_MAX_LENGTH,
  FIELD_NAME_MIN_LENGTH,
  FIELD_NAME_MAX_LENGTH,
  FIELD_PASSWORD_MIN_LENGTH,
  FIELD_PASSWORD_MAX_LENGTH,
  FIELD_USERNAME_MIN_LENGTH,
  FIELD_USERNAME_MAX_LENGTH,
  RECAPTCHA_SOCIAL_SIGN_IN_ACTION,
  RECAPTCHA_SIGN_UP_ACTION,
  RECAPTCHA_SIGN_IN_ACTION,
} from '@/constants'
import EmailIcon from '@/icons/EmailIcon'
import ChevronsLeftRightEllipsisIcon from '@/icons/ChevronsLeftRightEllipsisIcon'
import EyeIcon from '@/icons/EyeIcon'
import EyeOffIcon from '@/icons/EyeOffIcon'
import Trash2Icon from '@/icons/Trash2Icon'
import LockOpenIcon from '@/icons/LockOpenIcon'
import IdCardIcon from '@/icons/IdCardIcon'
import CameraIcon from '@/icons/CameraIcon'
import XIcon from '@/icons/XIcon'
import SmartphoneIcon from '@/icons/SmartphoneIcon'
import FieldErrorLabel from '@/ui/FieldErrorLabel'
import getAvatarUrlFromName from '@/utils/getAvatarUrlFromName'

const schema = yup
  .object({
    displayName: yup
      .string()
      .trim()
      .required('Campo requerido')
      .min(FIELD_NAME_MIN_LENGTH, 'Mínimo ${min} caracteres')
      .max(FIELD_NAME_MAX_LENGTH, 'Máximo ${max} caracteres'),
    phoneNumber: yup
      .string()
      .trim()
      .max(FIELD_PHONE_MAX_LENGTH, 'Máximo ${max} dígitos')
      .matches(REGEX_USER_PHONE, {
        message: 'Ejemplo: +573101234567',
        excludeEmptyString: true,
      }),
    username: yup
      .string()
      .trim()
      .lowercase()
      .required('Campo requerido')
      .min(FIELD_USERNAME_MIN_LENGTH, 'Mínimo ${min} caracteres')
      .max(FIELD_USERNAME_MAX_LENGTH, 'Máximo ${max} caracteres')
      .matches(REGEX_USER_USERNAME, 'Ejemplo: titor_1-2'),
  })
  .required()

function BaseComponent({ userData }) {
  // userData
  // uid: '6lsuIYvpDrNaxKSzdutt5SaYI5W2',

  // photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocLdEErmZAFLYBbn4r6_vy771l93pCD5FaVpm_bS6ds6sdB1LqPK=s96-c',
  // displayName: 'Andres Rosero Velasquez',
  // phoneNumber: null
  // username: 'rmBJvr_AjoUPQw5eoWiAA',
  // email: 'andresmedia84@gmail.com',

  // cada que el usuario actualice dejar un log en otra coleccion
  const [isLoading, setIsLoading] = useState(false)
  const [urlOrigin, setUrlOrigin] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      photoURL: userData?.photoURL ?? '',
      displayName: userData?.displayName ?? '',
      phoneNumber: userData?.phoneNumber ?? '',
      username: userData?.username ?? '',
    },
  })
  const usernameValue = watch('username')
  const photoURLValue = watch('photoURL')

  useEffect(() => {
    setUrlOrigin(window.location.origin)
  }, [])

  const onSubmitProfile = useCallback(async (formData) => {
    console.log(`🚀🚀🚀 -> formData:`, formData)
  }, [])

  const avatarUrl = isNonEmptyString(photoURLValue)
    ? photoURLValue
    : getAvatarUrlFromName(userData?.displayName)

  return (
    <div>
      <section className='flex justify-center items-center gap-3 pt-3 pb-5'>
        <button type='button' className='btn btn-circle'>
          <Trash2Icon />
        </button>

        <div className='avatar'>
          <div className='ring-accent ring-offset-base-100 w-24 rounded-full ring ring-offset-2'>
            <img alt='Foto de usuario' src={avatarUrl} />
          </div>
        </div>

        <button type='button' className='btn btn-circle'>
          <CameraIcon width='24' height='24' />
        </button>
      </section>

      <section>
        <form onSubmit={handleSubmit(onSubmitProfile)}>
          <div className='mb-5'>
            <label
              className={classNames(
                'input input-bordered flex items-center gap-2',
                {
                  'input-primary': !errors?.displayName,
                  'input-error': errors?.displayName,
                }
              )}
            >
              <IdCardIcon width='16' height='16' />
              <input
                type='text'
                className='grow'
                placeholder='Nombre o Alias'
                disabled={isLoading}
                {...register('displayName')}
              />
            </label>
            {errors?.displayName && (
              <FieldErrorLabel>{errors?.displayName?.message}</FieldErrorLabel>
            )}
          </div>

          <div className='mb-5'>
            <label
              className={classNames(
                'input input-bordered flex items-center gap-2',
                {
                  'input-primary': !errors?.phoneNumber,
                  'input-error': errors?.phoneNumber,
                }
              )}
            >
              <SmartphoneIcon width='16' height='16' />
              <input
                type='text'
                className='grow'
                placeholder='Teléfono'
                disabled={isLoading}
                {...register('phoneNumber')}
              />
            </label>
            {errors?.phoneNumber && (
              <FieldErrorLabel>{errors?.phoneNumber?.message}</FieldErrorLabel>
            )}
          </div>

          <div className='pb-1 text-xs sm:text-base min-h-5 sm:min-h-7 font-semibold w-full whitespace-nowrap overflow-hidden overflow-ellipsis'>
            {urlOrigin && (
              <>
                {urlOrigin + '/u/'}
                <span className='font-normal'>{usernameValue}</span>
              </>
            )}
          </div>
          <div className='mb-5'>
            <label
              className={classNames(
                'input input-bordered flex items-center gap-2',
                {
                  'input-primary': !errors?.username,
                  'input-error': errors?.username,
                }
              )}
            >
              <ChevronsLeftRightEllipsisIcon width='16' height='16' />
              <input
                type='text'
                className='grow'
                placeholder='Link de mi perfil'
                disabled={isLoading}
                {...register('username')}
              />
            </label>
            {errors?.username && (
              <FieldErrorLabel>{errors?.username?.message}</FieldErrorLabel>
            )}
          </div>

          <div className='mb-5'>
            <label
              className={classNames(
                'input input-bordered flex items-center gap-2',
                {
                  'input-primary': true,
                  'input-error': false,
                }
              )}
            >
              <EmailIcon width='16' height='16' />
              <input
                type='email'
                className='grow'
                placeholder='Email'
                disabled={true}
                defaultValue={userData?.email ?? ''}
              />
            </label>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='btn btn-primary btn-block text-lg'
          >
            {isLoading && <span className='loading loading-spinner' />}
            {`Guardar`}
          </button>
        </form>
      </section>
    </div>
  )
}

export default function EditProfile(props) {
  return (
    <Suspense>
      <BaseComponent {...props} />
    </Suspense>
  )
}
