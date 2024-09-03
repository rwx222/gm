'use client'
import classNames from 'classnames'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  inMemoryPersistence,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { isNonEmptyString } from 'ramda-adjunct'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import JsCookie from 'js-cookie'
import { useForm } from 'react-hook-form'

import deleteCsrfCookieAction from '@/actions/deleteCsrfCookieAction'
import EmailIcon from '@/icons/EmailIcon'
import MailCheckIcon from '@/icons/MailCheckIcon'
import firebaseConfig from '@/data/firebaseConfig'
import validateRecaptcha from '@/utils-front/validateRecaptcha'
import BasicModalDialog from '@/ui/BasicModalDialog'
import RecaptchaPolicyLabel from '@/ui/RecaptchaPolicyLabel'
import FieldErrorLabel from '@/ui/FieldErrorLabel'
import {
  PATH_AUTH,
  CSRF_TOKEN_NAME,
  ERROR_CODE_INVALID_CSRF,
  ERROR_CODE_RECAPTCHA_LOW_SCORE,
  ERROR_CODE_TOO_MANY_REQUESTS,
  FIELD_EMAIL_MAX_LENGTH,
  RECAPTCHA_FORGOT_PASSWORD,
} from '@/constants'

const MODAL_ID_CHECK_EMAIL_LINK = 'fp_check_email_link_modal_id'
const MODAL_ID_CSRF_ERROR = 'fp_csrf_error_modal_id'
const MODAL_ID_RECAPTCHA_ERROR = 'fp_recaptcha_min_score_error_modal_id'
const MODAL_ID_TOO_MANY_REQUESTS = 'fp_too_many_requests_modal_id'
const MODAL_ID_UNKNOWN_ERROR = 'fp_unknown_error_modal_id'

const schema = yup
  .object({
    email: yup
      .string()
      .trim()
      .lowercase()
      .required('Campo requerido')
      .email('Email inválido')
      .max(FIELD_EMAIL_MAX_LENGTH, 'Máximo ${max} caracteres'),
  })
  .required()

function BaseComponent() {
  const authRef = useRef(null)

  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(schema) })

  useEffect(() => {
    const app = initializeApp(firebaseConfig)
    authRef.current = getAuth(app)

    authRef.current.setPersistence(inMemoryPersistence)
    authRef.current.useDeviceLanguage()
  }, [])

  const handleErrorMessage = useCallback(
    (error) => {
      const errorMsg = isNonEmptyString(error?.message) ? error?.message : ''

      if (errorMsg.includes(ERROR_CODE_INVALID_CSRF)) {
        JsCookie.remove(CSRF_TOKEN_NAME)
        document.getElementById(MODAL_ID_CSRF_ERROR).showModal()
        deleteCsrfCookieAction()
          .then(() => null)
          .catch((error) => {
            console.error(error)
            console.error(`💥> HEM '${error?.message}'`)
          })
          .finally(() => {
            router.refresh()
          })
      } else if (errorMsg.includes(ERROR_CODE_RECAPTCHA_LOW_SCORE)) {
        document.getElementById(MODAL_ID_RECAPTCHA_ERROR).showModal()
      } else if (errorMsg.includes(ERROR_CODE_TOO_MANY_REQUESTS)) {
        document.getElementById(MODAL_ID_TOO_MANY_REQUESTS).showModal()
      } else {
        document.getElementById(MODAL_ID_UNKNOWN_ERROR).showModal()
      }
    },
    [router]
  )

  const onSubmit = useCallback(
    async (formData) => {
      try {
        setIsLoading(true)

        await validateRecaptcha(RECAPTCHA_FORGOT_PASSWORD)

        await sendPasswordResetEmail(authRef.current, formData.email, {
          url: window.location.origin + PATH_AUTH + '?email=' + formData.email,
        })

        reset()
        document.getElementById(MODAL_ID_CHECK_EMAIL_LINK).showModal()
      } catch (error) {
        console.error(error)
        console.error(`💥> CPS '${error?.message}'`)
        handleErrorMessage(error)
      } finally {
        setIsLoading(false)
      }
    },
    [handleErrorMessage, reset]
  )

  return (
    <div className='md:pt-20'>
      <div role='tablist' className='tabs tabs-lifted tabs-lg'>
        <input
          type='radio'
          name='sign_in_up_tabs'
          role='tab'
          className='tab text-base xs:text-lg font-medium'
          aria-label='🔑'
          defaultChecked
        />
        <div
          role='tabpanel'
          className='tab-content bg-base-100 border-base-300 rounded-box p-4 sm:p-5'
        >
          <main>
            <h1 className='text-xl font-bold mb-5 text-center'>{`Recuperar Contraseña`}</h1>
            <p>{`Te enviaremos un enlace al email registrado a tu cuenta para que puedas cambiar tu contraseña.`}</p>

            <div className='divider text-sm'>{`EMAIL REGISTRADO`}</div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='mb-5'>
                <label
                  className={classNames(
                    'input input-bordered text-lg flex items-center gap-2',
                    {
                      'input-accent': !errors?.email,
                      'input-error': errors?.email,
                    }
                  )}
                >
                  <EmailIcon className='text-accent' />
                  <input
                    type='email'
                    className='grow'
                    placeholder='* Email'
                    {...register('email')}
                  />
                </label>
                {errors?.email && (
                  <FieldErrorLabel>{errors?.email?.message}</FieldErrorLabel>
                )}
              </div>

              <button
                type='submit'
                disabled={isLoading}
                className='btn btn-accent btn-block text-lg'
              >
                {isLoading && <span className='loading loading-spinner' />}
                {`Enviar Enlace`}
              </button>

              <RecaptchaPolicyLabel />
            </form>
          </main>
        </div>
      </div>

      <section className='py-4 flex flex-row justify-center'>
        <Link
          href={PATH_AUTH}
          prefetch={false}
          disabled={isLoading}
          className='btn btn-wide text-lg'
        >
          {isLoading && <span className='loading loading-spinner' />}

          {`Volver`}
        </Link>
      </section>

      <ErrorModalsSection />
    </div>
  )
}

export default function ChangePassword(props) {
  return (
    <Suspense>
      <BaseComponent {...props} />
    </Suspense>
  )
}

const ErrorModalsSection = () => {
  return (
    <section>
      <BasicModalDialog
        id={MODAL_ID_CHECK_EMAIL_LINK}
        title={<div className='text-success'>{`Revisa Tu Email`}</div>}
        description={
          <div className='flex items-start pb-5'>
            <div className='shrink-0 grow-0 basis-8 pt-1 text-success'>
              <MailCheckIcon width='24' height='24' />
            </div>
            {`Te enviamos un enlace a tu email para cambiar tu contraseña.`}
          </div>
        }
      />

      <BasicModalDialog
        id={MODAL_ID_TOO_MANY_REQUESTS}
        title={`Muchos Intentos`}
        description={`Cuidado, estas haciendo demasiados intentos en poco tiempo. Por favor, intenta mas tarde.`}
      />

      <BasicModalDialog
        id={MODAL_ID_CSRF_ERROR}
        title={`Intenta Otra Vez`}
        description={`Por seguridad y debido a inactividad no se realizó la acción. Por favor, intenta otra vez.`}
      />

      <BasicModalDialog
        id={MODAL_ID_RECAPTCHA_ERROR}
        title={`Error De Seguridad`}
        description={`No pudimos determinar un nivel de seguridad válido. Por favor, intenta mas tarde.`}
      />

      <BasicModalDialog
        id={MODAL_ID_UNKNOWN_ERROR}
        title={`Error Inesperado`}
        description={`Ha ocurrido un error inesperado. Por favor, recarga la página e intenta otra vez.`}
      />
    </section>
  )
}
