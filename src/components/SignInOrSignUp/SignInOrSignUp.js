'use client'
import classNames from 'classnames'
import { initializeApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  getAuth,
  inMemoryPersistence,
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
import { pick, takeLast } from 'ramda'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import JsCookie from 'js-cookie'

import deleteCsrfCookieAction from '@/actions/deleteCsrfCookieAction'
import GoogleIcon from '@/icons/GoogleIcon'
import FacebookIcon from '@/icons/FacebookIcon'
import EmailIcon from '@/icons/EmailIcon'
import EyeIcon from '@/icons/EyeIcon'
import EyeOffIcon from '@/icons/EyeOffIcon'
import LockIcon from '@/icons/LockIcon'
import LockOpenIcon from '@/icons/LockOpenIcon'
import IdCardIcon from '@/icons/IdCardIcon'
import firebaseConfig from '@/data/firebaseConfig'
import getCookie from '@/utils-front/getCookie'
import {
  CSRF_TOKEN_NAME,
  INVALID_CSRF_ERROR_CODE,
  AFTER_LOGIN_PATH,
} from '@/constants'

const AUTH_CSRF_ERROR_MODAL_ID = 'auth_csrf_error_modal'
const AUTH_UNKNOWN_ERROR_MODAL_ID = 'auth_unknown_error_modal'

function BaseComponent() {
  const searchParams = useSearchParams()
  const urlTab = searchParams.get('tab') ?? ''
  const authRef = useRef(null)
  const dbRef = useRef(null)
  const googleProviderRef = useRef(null)
  const facebookProviderRef = useRef(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [showPasswd, setShowPasswd] = useState(false)
  const [isSignInTab, setIsSignInTab] = useState(() => {
    return urlTab.toLocaleLowerCase() !== 'signup'
  })
  const router = useRouter()

  useEffect(() => {
    const app = initializeApp(firebaseConfig)
    authRef.current = getAuth(app)
    authRef.current.setPersistence(inMemoryPersistence)
    authRef.current.useDeviceLanguage()
    dbRef.current = getFirestore(app)

    googleProviderRef.current = new GoogleAuthProvider()
    facebookProviderRef.current = new FacebookAuthProvider()
  }, [])

  const makeLoginWithFn = useCallback(
    (provider) => async () => {
      try {
        setIsAuthenticating(true)
        const result = await signInWithPopup(
          authRef.current,
          provider === 'facebook'
            ? facebookProviderRef.current
            : googleProviderRef.current
        )
        const uid = result.user.uid
        const userPayload = {
          username: nanoid(),
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          phoneNumber: result.user.phoneNumber,
          providerData: result.user.providerData,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          loginCount: increment(1),
        }
        const userDocRef = doc(dbRef.current, 'users', uid)
        const userDocSnap = await getDoc(userDocRef)
        const userExists = userDocSnap.exists()

        if (userExists) {
          const fieldsToUpdate = pick(
            ['photoURL', 'providerData', 'lastLogin', 'loginCount'],
            userPayload
          )
          await setDoc(userDocRef, fieldsToUpdate, { merge: true })
        } else {
          await setDoc(userDocRef, userPayload)
        }
        const userIdToken = await result.user.getIdToken()
        const csrfToken = getCookie(CSRF_TOKEN_NAME)

        const sessionRes = await fetch('/api/session', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userIdToken}`,
            [CSRF_TOKEN_NAME]: csrfToken,
          },
        })
        const sessionData = await sessionRes.json()

        if (!sessionRes.ok || !sessionData?.uid) {
          throw new Error(
            sessionData?.code || sessionData?.message || sessionRes.statusText
          )
        } else {
          const now = new Date()
          const nowTime = now.getTime()
          const tid = takeLast(6, `${nowTime}`)

          router.replace(AFTER_LOGIN_PATH + '?tid=' + tid)
        }
      } catch (error) {
        const errorMsg = error?.message ?? ''
        console.error(error)
        console.error(`💥 '${errorMsg}'`)

        if (errorMsg && errorMsg.includes(INVALID_CSRF_ERROR_CODE)) {
          JsCookie.remove(CSRF_TOKEN_NAME)
          document.getElementById(AUTH_CSRF_ERROR_MODAL_ID).showModal()
          deleteCsrfCookieAction()
            .then(() => {
              router.refresh()
            })
            .catch((error) => {
              console.error(error)
              router.refresh()
            })
        } else {
          document.getElementById(AUTH_UNKNOWN_ERROR_MODAL_ID).showModal()
        }
      } finally {
        setIsAuthenticating(false)
      }
    },
    [router]
  )

  const goToSignIn = useCallback(() => {
    setIsSignInTab(true)
    setShowPasswd(false)
  }, [])

  const goToSignUp = useCallback(() => {
    setIsSignInTab(false)
    setShowPasswd(true)
  }, [])

  const SocialButtons = (
    <div className='pt-4 flex justify-center gap-5'>
      <ProviderButton
        onClick={makeLoginWithFn('google')}
        disabled={isAuthenticating}
      >
        <GoogleIcon />
        <span className='hidden xs:block xs:ml-2'>{`Google`}</span>
      </ProviderButton>

      <ProviderButton
        onClick={makeLoginWithFn('facebook')}
        disabled={isAuthenticating}
      >
        <FacebookIcon />
        <span className='hidden xs:block xs:ml-2'>{`Facebook`}</span>
      </ProviderButton>
    </div>
  )

  return (
    <>
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

          <label className='mb-5 input input-bordered input-primary flex items-center gap-2'>
            <EmailIcon width='16' height='16' />
            <input type='email' className='grow' placeholder='Email' />
          </label>

          <label className='mb-5 input input-bordered input-primary flex items-center gap-2'>
            {showPasswd ? (
              <LockOpenIcon width='16' height='16' />
            ) : (
              <LockIcon width='16' height='16' />
            )}
            <input
              type={showPasswd ? 'text' : 'password'}
              className='grow'
              placeholder='Contraseña'
            />
          </label>

          <ShowHidePassword
            showPasswd={showPasswd}
            setShowPasswd={setShowPasswd}
          >
            <button
              type='button'
              onClick={goToSignUp}
              className='underline font-medium text-primary text-sm xs:text-base'
            >{`No tengo una cuenta`}</button>
          </ShowHidePassword>

          <button
            type='button'
            disabled={isAuthenticating}
            className='btn btn-primary btn-block text-lg'
          >
            {isAuthenticating && <span className='loading loading-spinner' />}
            {`Iniciar sesión`}
          </button>
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

          <label className='mb-5 input input-bordered input-secondary flex items-center gap-2'>
            <IdCardIcon width='16' height='16' />
            <input type='text' className='grow' placeholder='Nombre completo' />
          </label>

          <label className='mb-5 input input-bordered input-secondary flex items-center gap-2'>
            <EmailIcon width='16' height='16' />
            <input type='email' className='grow' placeholder='Email' />
          </label>

          <label className='mb-5 input input-bordered input-secondary flex items-center gap-2'>
            {showPasswd ? (
              <LockOpenIcon width='16' height='16' />
            ) : (
              <LockIcon width='16' height='16' />
            )}
            <input
              type={showPasswd ? 'text' : 'password'}
              className='grow'
              placeholder='Contraseña'
            />
          </label>

          <ShowHidePassword
            showPasswd={showPasswd}
            setShowPasswd={setShowPasswd}
          >
            <button
              type='button'
              onClick={goToSignIn}
              className='underline font-medium text-secondary text-sm xs:text-base'
            >{`Ya tengo una cuenta`}</button>
          </ShowHidePassword>

          <button
            type='button'
            disabled={isAuthenticating}
            className='btn btn-secondary btn-block text-lg'
          >
            {isAuthenticating && <span className='loading loading-spinner' />}
            {`Crear cuenta`}
          </button>
        </TabItem>
      </div>

      <section className='py-4 flex flex-row justify-center'>
        <Link
          href='/home'
          prefetch={false}
          disabled={isAuthenticating}
          className='btn btn-wide text-lg'
        >
          {isAuthenticating && <span className='loading loading-spinner' />}

          {`Volver`}
        </Link>
      </section>

      <section>
        <ModalDialog
          id={AUTH_CSRF_ERROR_MODAL_ID}
          title={`Intenta otra vez`}
          description={`Algo salió mal. Por favor, recarga la página e intenta iniciar sesión otra vez.`}
        />

        <ModalDialog
          id={AUTH_UNKNOWN_ERROR_MODAL_ID}
          title={`Error inesperado`}
          description={`Ha ocurrido un error inesperado. Por favor, recarga la página e intenta iniciar sesión otra vez.`}
        />
      </section>
    </>
  )
}

export default function SignInOrSignUp(props) {
  return (
    <Suspense>
      <BaseComponent {...props} />
    </Suspense>
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

const ModalDialog = ({ id, title, description }) => {
  return (
    <dialog id={id} className='modal modal-bottom sm:modal-middle'>
      <div className='modal-box'>
        <h3 className='font-bold text-lg'>{title}</h3>
        <p className='py-4'>{description}</p>
        <div className='modal-action'>
          <form method='dialog'>
            <button type='submit' className='btn'>
              {`Cerrar`}
            </button>
          </form>
        </div>
      </div>
    </dialog>
  )
}
