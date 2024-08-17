'use client'
import classNames from 'classnames'
import { initializeApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  getAuth,
  signInWithRedirect,
  getRedirectResult,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { nanoid } from 'nanoid'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { pick, takeLast } from 'ramda'
import { isNonEmptyString } from 'ramda-adjunct'
import { useRouter, useSearchParams } from 'next/navigation'
import JsCookie from 'js-cookie'
import { useForm } from 'react-hook-form'

import normalizeSpaces from '@/utils/normalizeSpaces'
import deleteCsrfCookieAction from '@/actions/deleteCsrfCookieAction'
import GoogleIcon from '@/icons/GoogleIcon'
import FacebookIcon from '@/icons/FacebookIcon'
import EmailIcon from '@/icons/EmailIcon'
import EyeIcon from '@/icons/EyeIcon'
import EyeOffIcon from '@/icons/EyeOffIcon'
import LockIcon from '@/icons/LockIcon'
import LockOpenIcon from '@/icons/LockOpenIcon'
import IdCardIcon from '@/icons/IdCardIcon'
import MailCheckIcon from '@/icons/MailCheckIcon'
import BadgeCheckIcon from '@/icons/BadgeCheckIcon'
import firebaseConfig from '@/data/firebaseConfig'
import getCookie from '@/utils-front/getCookie'
import validateRecaptcha from '@/utils-front/validateRecaptcha'
import BasicModalDialog from '@/ui/BasicModalDialog'
import RecaptchaPolicyLabel from '@/ui/RecaptchaPolicyLabel'
import FieldErrorLabel from '@/ui/FieldErrorLabel'
import {
  PATH_HOME,
  PATH_AUTH,
  PATH_FORGOT_PASSWORD,
  CSRF_TOKEN_NAME,
  PROVIDER_ID_GOOGLE,
  PROVIDER_ID_FACEBOOK,
  REGEX_USER_PASSWORD,
  ERROR_CODE_INVALID_CSRF,
  ERROR_CODE_RECAPTCHA_LOW_SCORE,
  ERROR_CODE_EMAIL_ALREADY_IN_USE,
  ERROR_CODE_INVALID_CREDENTIAL,
  ERROR_CODE_POPUP_CLOSED,
  ERROR_CODE_TOO_MANY_REQUESTS,
  FIELD_EMAIL_MAX_LENGTH,
  FIELD_NAME_MAX_LENGTH,
  FIELD_PASSWORD_MIN_LENGTH,
  FIELD_PASSWORD_MAX_LENGTH,
  RECAPTCHA_SOCIAL_SIGN_IN_ACTION,
  RECAPTCHA_SIGN_UP_ACTION,
  RECAPTCHA_SIGN_IN_ACTION,
} from '@/constants'

const MODAL_ID_CSRF_ERROR = 'auth_csrf_error_modal_id'
const MODAL_ID_UNKNOWN_ERROR = 'auth_unknown_error_modal_id'
const MODAL_ID_RECAPTCHA_ERROR = 'auth_recaptcha_min_score_error_modal_id'
const MODAL_ID_EMAIL_ALREADY_IN_USE = 'auth_email_already_in_use_modal_id'
const MODAL_ID_INVALID_CREDENTIAL = 'auth_invalid_credential_modal_id'
const MODAL_ID_POPUP_CLOSED = 'auth_popup_closed_modal_id'
const MODAL_ID_VERIFY_EMAIL = 'verify_email_modal_id'
const MODAL_ID_TOO_MANY_REQUESTS = 'too_many_requests_modal_id'

const schemaUp = yup
  .object({
    name: yup
      .string()
      .trim()
      .required('Campo requerido')
      .min(2, 'Mínimo ${min} caracteres')
      .max(FIELD_NAME_MAX_LENGTH, 'Máximo ${max} caracteres'),
    email: yup
      .string()
      .trim()
      .lowercase()
      .required('Campo requerido')
      .email('Email inválido')
      .max(FIELD_EMAIL_MAX_LENGTH, 'Máximo ${max} caracteres'),
    password: yup
      .string()
      .required('Campo requerido')
      .min(FIELD_PASSWORD_MIN_LENGTH, 'Mínimo ${min} caracteres')
      .max(FIELD_PASSWORD_MAX_LENGTH, 'Máximo ${max} caracteres')
      .matches(
        REGEX_USER_PASSWORD,
        'Debe tener al menos una mayúscula, una minúscula y un número'
      ),
  })
  .required()

const schemaIn = yup
  .object({
    email: yup
      .string()
      .trim()
      .lowercase()
      .required('Campo requerido')
      .email('Email inválido')
      .max(FIELD_EMAIL_MAX_LENGTH, 'Máximo ${max} caracteres'),
    password: yup
      .string()
      .required('Campo requerido')
      .min(FIELD_PASSWORD_MIN_LENGTH, 'Mínimo ${min} caracteres')
      .max(FIELD_PASSWORD_MAX_LENGTH, 'Máximo ${max} caracteres'),
  })
  .required()

function BaseComponent() {
  const searchParams = useSearchParams()
  const urlTab = searchParams.get('tab') ?? ''
  const urlEmail = searchParams.get('email') ?? ''

  const authRef = useRef(null)
  const dbRef = useRef(null)
  const googleProviderRef = useRef(null)
  const facebookProviderRef = useRef(null)

  const [isAuthenticating, setIsAuthenticating] = useState(true)
  const [showPasswd, setShowPasswd] = useState(false)
  const [isSignInTab, setIsSignInTab] = useState(() => {
    return urlTab.toLocaleLowerCase() !== 'signup'
  })

  const router = useRouter()

  const {
    register: registerUp,
    handleSubmit: handleSubmitUp,
    formState: { errors: errorsUp },
    reset: resetSignUp,
  } = useForm({ resolver: yupResolver(schemaUp) })

  const {
    register: registerIn,
    handleSubmit: handleSubmitIn,
    formState: { errors: errorsIn },
    reset: resetSignIn,
  } = useForm({ resolver: yupResolver(schemaIn) })

  useEffect(() => {
    const app = initializeApp(firebaseConfig)
    authRef.current = getAuth(app)
    authRef.current.setPersistence(browserSessionPersistence)
    authRef.current.useDeviceLanguage()
    dbRef.current = getFirestore(app)

    googleProviderRef.current = new GoogleAuthProvider()
    facebookProviderRef.current = new FacebookAuthProvider()
  }, [])

  const goToSignIn = useCallback(() => {
    setIsSignInTab(true)
    setShowPasswd(false)
  }, [])

  const goToSignUp = useCallback(() => {
    setIsSignInTab(false)
    setShowPasswd(true)
  }, [])

  const performLogin = useCallback(
    async (result, newUserDisplayname = null) => {
      const uid = result.user.uid
      const userPayload = {
        username: nanoid(),
        email: result.user.email,
        displayName: result.user.displayName || newUserDisplayname,
        photoURL: result.user.photoURL,
        phoneNumber: result.user.phoneNumber,
        createdAt: serverTimestamp(),
        providerData: result.user.providerData,
        lastLogin: serverTimestamp(),
        loginCount: increment(1),
      }

      const userDocRef = doc(dbRef.current, 'users', uid)
      const userDocSnap = await getDoc(userDocRef)
      const userExists = userDocSnap.exists()

      if (userExists) {
        // if user exists, update only some fields
        const fieldsToUpdate = pick(
          ['providerData', 'lastLogin', 'loginCount'],
          userPayload
        )
        await setDoc(userDocRef, fieldsToUpdate, { merge: true })
      } else {
        // if user doesn't exist, create it with the whole payload
        await setDoc(userDocRef, userPayload)
      }

      if (!result.user.emailVerified) {
        await sendEmailVerification(result.user, {
          url:
            window.location.origin + PATH_AUTH + '?email=' + result.user.email,
        })

        resetSignUp()
        resetSignIn()
        goToSignIn()
        document.getElementById(MODAL_ID_VERIFY_EMAIL).showModal()
        setIsAuthenticating(false)

        return null
      }

      const userIdToken = await result.user.getIdToken()
      const csrfToken = getCookie(CSRF_TOKEN_NAME)
      const sessionRes = await fetch('/api/session', {
        method: 'PUT',
        headers: {
          [CSRF_TOKEN_NAME]: csrfToken,
          Authorization: `Bearer ${userIdToken}`,
        },
      })
      const sessionData = await sessionRes.json()

      if (!sessionRes.ok || !sessionData?.uid) {
        setIsAuthenticating(false)

        throw new Error(
          sessionData?.code || sessionData?.message || sessionRes.statusText
        )
      }

      const now = new Date()
      const nowTime = now.getTime()
      const tid = takeLast(6, `${nowTime}`)

      router.replace(PATH_HOME + '?tid=' + tid)
    },
    [goToSignIn, resetSignIn, resetSignUp, router]
  )

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
      } else if (errorMsg.includes(ERROR_CODE_EMAIL_ALREADY_IN_USE)) {
        document.getElementById(MODAL_ID_EMAIL_ALREADY_IN_USE).showModal()
      } else if (errorMsg.includes(ERROR_CODE_INVALID_CREDENTIAL)) {
        document.getElementById(MODAL_ID_INVALID_CREDENTIAL).showModal()
      } else if (errorMsg.includes(ERROR_CODE_POPUP_CLOSED)) {
        document.getElementById(MODAL_ID_POPUP_CLOSED).showModal()
      } else if (errorMsg.includes(ERROR_CODE_TOO_MANY_REQUESTS)) {
        document.getElementById(MODAL_ID_TOO_MANY_REQUESTS).showModal()
      } else {
        document.getElementById(MODAL_ID_UNKNOWN_ERROR).showModal()
      }
    },
    [router]
  )

  const makeLoginWithProviderFn = useCallback(
    (provider) => async () => {
      try {
        setIsAuthenticating(true)

        await validateRecaptcha(RECAPTCHA_SOCIAL_SIGN_IN_ACTION)

        await signInWithRedirect(
          authRef.current,
          provider === PROVIDER_ID_FACEBOOK
            ? facebookProviderRef.current
            : googleProviderRef.current
        )
      } catch (error) {
        console.error(error)
        console.error(`💥> LWP '${error?.message}'`)
        handleErrorMessage(error)
        setIsAuthenticating(false)
      }
    },
    [handleErrorMessage]
  )

  const onSubmitSignIn = useCallback(
    async (formData) => {
      try {
        setIsAuthenticating(true)

        await validateRecaptcha(RECAPTCHA_SIGN_IN_ACTION)

        const result = await signInWithEmailAndPassword(
          authRef.current,
          formData.email,
          formData.password
        )
        await performLogin(result)
      } catch (error) {
        console.error(error)
        console.error(`💥> SSI '${error?.message}'`)
        setIsAuthenticating(false)
        handleErrorMessage(error)
      }
    },
    [handleErrorMessage, performLogin]
  )

  const onSubmitSignUp = useCallback(
    async (formData) => {
      try {
        setIsAuthenticating(true)

        await validateRecaptcha(RECAPTCHA_SIGN_UP_ACTION)

        const cleanedDisplayName = normalizeSpaces(formData.name)
        const result = await createUserWithEmailAndPassword(
          authRef.current,
          formData.email,
          formData.password
        )
        await performLogin(result, cleanedDisplayName)
      } catch (error) {
        console.error(error)
        console.error(`💥> SSU '${error?.message}'`)
        setIsAuthenticating(false)
        handleErrorMessage(error)
      }
    },
    [handleErrorMessage, performLogin]
  )

  useEffect(() => {
    const afterAuth = async () => {
      try {
        const result = await getRedirectResult(authRef.current)

        if (result) {
          await performLogin(result)
        } else {
          setIsAuthenticating(false)
        }
      } catch (error) {
        console.error(error)
        console.error(`💥> AAR '${error?.message}'`)
        setIsAuthenticating(false)
        handleErrorMessage(error)
      }
    }

    afterAuth()
  }, [handleErrorMessage, performLogin])

  const SocialButtons = (
    <div className='pt-4 flex justify-center gap-5'>
      <ProviderButton
        onClick={makeLoginWithProviderFn(PROVIDER_ID_GOOGLE)}
        disabled={isAuthenticating}
      >
        <GoogleIcon />
        <span className='hidden xs:block xs:ml-2'>{`Google`}</span>
      </ProviderButton>

      <ProviderButton
        onClick={makeLoginWithProviderFn(PROVIDER_ID_FACEBOOK)}
        disabled={isAuthenticating}
      >
        <FacebookIcon />
        <span className='hidden xs:block xs:ml-2'>{`Facebook`}</span>
      </ProviderButton>
    </div>
  )

  return (
    <div className='md:pt-20'>
      <div role='tablist' className='tabs tabs-lifted tabs-lg'>
        <TabItem
          title='Ingresar'
          isActive={isSignInTab}
          onChange={goToSignIn}
          tabClassName={classNames({
            'font-semibold': isSignInTab,
            'font-medium': !isSignInTab,
          })}
        >
          <p>{`Puedes ingresar con tus cuentas de:`}</p>
          {SocialButtons}
          <div className='divider text-sm'>{`O INGRESAR CON`}</div>

          <form onSubmit={handleSubmitIn(onSubmitSignIn)}>
            <div className='mb-5'>
              <label
                className={classNames(
                  'input input-bordered flex items-center gap-2',
                  {
                    'input-primary': !errorsIn?.email,
                    'input-error': errorsIn?.email,
                  }
                )}
              >
                <EmailIcon width='16' height='16' />
                <input
                  type='email'
                  className='grow'
                  placeholder='Email'
                  defaultValue={urlEmail}
                  disabled={isAuthenticating}
                  {...registerIn('email')}
                />
              </label>
              {errorsIn?.email && (
                <FieldErrorLabel>{errorsIn?.email?.message}</FieldErrorLabel>
              )}
            </div>

            <div className='mb-5'>
              <label
                className={classNames(
                  'input input-bordered flex items-center gap-2',
                  {
                    'input-primary': !errorsIn?.password,
                    'input-error': errorsIn?.password,
                  }
                )}
              >
                {showPasswd ? (
                  <LockOpenIcon width='16' height='16' />
                ) : (
                  <LockIcon width='16' height='16' />
                )}
                <input
                  type={showPasswd ? 'text' : 'password'}
                  className='grow'
                  placeholder='Contraseña'
                  disabled={isAuthenticating}
                  {...registerIn('password')}
                />
              </label>
              {errorsIn?.password && (
                <FieldErrorLabel>{errorsIn?.password?.message}</FieldErrorLabel>
              )}
            </div>

            <ShowHidePassword
              showPasswd={showPasswd}
              setShowPasswd={setShowPasswd}
            >
              <button
                type='button'
                disabled={isAuthenticating}
                onClick={goToSignUp}
                className='underline font-normal text-primary text-sm xs:text-base'
              >{`No tengo una cuenta`}</button>
            </ShowHidePassword>

            <button
              type='submit'
              disabled={isAuthenticating}
              className='btn btn-primary btn-block text-lg'
            >
              {isAuthenticating && <span className='loading loading-spinner' />}
              {`Iniciar sesión`}
            </button>

            <div className='text-center pt-5'>
              <button
                type='button'
                disabled={isAuthenticating}
                onClick={() => router.push(PATH_FORGOT_PASSWORD)}
                className='underline font-normal text-primary text-sm xs:text-base'
              >{`Olvidé mi contraseña`}</button>
            </div>

            <RecaptchaPolicyLabel />
          </form>
        </TabItem>

        <TabItem
          title='Registrarme'
          isActive={!isSignInTab}
          onChange={goToSignUp}
          tabClassName={classNames({
            'font-semibold': !isSignInTab,
            'font-medium': isSignInTab,
          })}
        >
          <p>{`Te puedes registrar con tus cuentas de:`}</p>
          {SocialButtons}
          <div className='divider text-sm'>{`O CONTINUAR CON`}</div>

          <form onSubmit={handleSubmitUp(onSubmitSignUp)}>
            <div className='mb-5'>
              <label
                className={classNames(
                  'input input-bordered flex items-center gap-2',
                  {
                    'input-secondary': !errorsUp?.name,
                    'input-error': errorsUp?.name,
                  }
                )}
              >
                <IdCardIcon width='16' height='16' />
                <input
                  type='text'
                  className='grow'
                  placeholder='Nombre o Alias'
                  disabled={isAuthenticating}
                  {...registerUp('name')}
                />
              </label>
              {errorsUp?.name && (
                <FieldErrorLabel>{errorsUp?.name?.message}</FieldErrorLabel>
              )}
            </div>

            <div className='mb-5'>
              <label
                className={classNames(
                  'input input-bordered flex items-center gap-2',
                  {
                    'input-secondary': !errorsUp?.email,
                    'input-error': errorsUp?.email,
                  }
                )}
              >
                <EmailIcon width='16' height='16' />
                <input
                  type='email'
                  className='grow'
                  placeholder='Email'
                  disabled={isAuthenticating}
                  {...registerUp('email')}
                />
              </label>
              {errorsUp?.email && (
                <FieldErrorLabel>{errorsUp?.email?.message}</FieldErrorLabel>
              )}
            </div>

            <div className='mb-5'>
              <label
                className={classNames(
                  'input input-bordered flex items-center gap-2',
                  {
                    'input-secondary': !errorsUp?.password,
                    'input-error': errorsUp?.password,
                  }
                )}
              >
                {showPasswd ? (
                  <LockOpenIcon width='16' height='16' />
                ) : (
                  <LockIcon width='16' height='16' />
                )}
                <input
                  type={showPasswd ? 'text' : 'password'}
                  className='grow'
                  placeholder='Contraseña'
                  disabled={isAuthenticating}
                  {...registerUp('password', {
                    minLength: 8,
                    maxLength: 13,
                    required: true,
                  })}
                />
              </label>
              {errorsUp?.password && (
                <FieldErrorLabel>{errorsUp?.password?.message}</FieldErrorLabel>
              )}
            </div>

            <ShowHidePassword
              showPasswd={showPasswd}
              setShowPasswd={setShowPasswd}
            >
              <button
                type='button'
                onClick={goToSignIn}
                disabled={isAuthenticating}
                className='underline font-normal text-secondary text-sm xs:text-base'
              >{`Ya tengo una cuenta`}</button>
            </ShowHidePassword>

            <button
              type='submit'
              disabled={isAuthenticating}
              className='btn btn-secondary btn-block text-lg'
            >
              {isAuthenticating && <span className='loading loading-spinner' />}
              {`Crear cuenta`}
            </button>
            <RecaptchaPolicyLabel />
          </form>
        </TabItem>
      </div>

      <section className='py-4 flex flex-row justify-center'>
        <button
          type='button'
          disabled={isAuthenticating}
          onClick={() => router.push(PATH_HOME)}
          className='btn btn-wide text-lg'
        >
          {isAuthenticating && <span className='loading loading-spinner' />}

          {`Volver`}
        </button>
      </section>

      <ErrorModalsSection />
    </div>
  )
}

export default function SignInOrSignUp(props) {
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
        id={MODAL_ID_VERIFY_EMAIL}
        title={<div className='text-success'>{`Verifica Tu Email`}</div>}
        description={
          <>
            <div className='flex items-start pb-5'>
              <div className='shrink-0 grow-0 basis-8 pt-1 text-success'>
                <MailCheckIcon width='24' height='24' />
              </div>
              {`Te enviamos un correo de verificación a tu email.`}
            </div>

            <div className='flex items-start'>
              <div className='shrink-0 grow-0 basis-8 pt-1 text-success'>
                <BadgeCheckIcon width='24' height='24' />
              </div>
              {`Verifica tu email para poder iniciar sesión.`}
            </div>
          </>
        }
      />

      <BasicModalDialog
        id={MODAL_ID_TOO_MANY_REQUESTS}
        title={`Muchos Intentos`}
        description={`Cuidado, estas haciendo demasiados intentos en poco tiempo. Por favor, intenta mas tarde.`}
      />

      <BasicModalDialog
        id={MODAL_ID_POPUP_CLOSED}
        title={`Ingreso Interrumpido`}
        description={`Se interrumpió el proceso de ingreso antes de completarlo. Por favor, intenta otra vez.`}
      />

      <BasicModalDialog
        id={MODAL_ID_INVALID_CREDENTIAL}
        title={`Email/Contraseña Incorrectos`}
        description={`El email o contraseña son incorrectos. Por favor, revisa los campos e intenta otra vez.`}
      />

      <BasicModalDialog
        id={MODAL_ID_EMAIL_ALREADY_IN_USE}
        title={`Ya Tienes una cuenta`}
        description={`Ya existe una cuenta con este email. Puedes iniciar sesión, o intentar con otro email.`}
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

const TabItem = ({ children, title, isActive, onChange, tabClassName }) => {
  return (
    <>
      <input
        type='radio'
        name='sign_in_up_tabs'
        role='tab'
        className={classNames('tab text-base xs:text-lg', tabClassName)}
        aria-label={title}
        checked={isActive}
        onChange={onChange}
      />
      <div
        role='tabpanel'
        className='tab-content bg-base-100 border-base-300 rounded-box p-4 sm:p-5'
      >
        {children}
      </div>
    </>
  )
}

const ShowHidePassword = ({ showPasswd, setShowPasswd, children }) => {
  return (
    <div className='flex items-center justify-between pb-5'>
      {children}

      <label
        className='swap btn btn-sm'
        title={showPasswd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        <input
          type='checkbox'
          checked={showPasswd}
          onChange={(e) => setShowPasswd(e.target.checked)}
        />
        <EyeIcon className='swap-on' width='24' height='24' />
        <EyeOffIcon className='swap-off' width='24' height='24' />
      </label>
    </div>
  )
}

const ProviderButton = ({ children, ...props }) => {
  return (
    <button
      {...props}
      type='button'
      className='flex flex-row items-center justify-center py-2 px-3 sm:px-5 sm:min-w-44 bg-white hover:bg-gray-200 text-gray-800 text-sm xs:text-base sm:text-lg shadow-md border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-wait'
    >
      {children}
    </button>
  )
}
