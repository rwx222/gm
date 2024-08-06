'use client'
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
import { useRouter } from 'next/navigation'
import JsCookie from 'js-cookie'

import deleteCsrfCookieAction from '@/actions/deleteCsrfCookieAction'
import GoogleIcon from '@/icons/GoogleIcon'
// import FacebookIcon from '@/icons/FacebookIcon'
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
  const authRef = useRef(null)
  const dbRef = useRef(null)
  const googleProviderRef = useRef(null)
  const facebookProviderRef = useRef(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
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
        console.error(error)
        console.error(`💥 '${error?.message}'`)

        if (error?.message === INVALID_CSRF_ERROR_CODE) {
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

  return (
    <section className='flex justify-center py-8'>
      <div className='card glass w-11/12 max-w-sm'>
        <div className='card-body gap-4'>
          <ProviderButton
            onClick={makeLoginWithFn('google')}
            disabled={isAuthenticating}
          >
            <GoogleIcon />
            {`Ingresar con Google`}
          </ProviderButton>

          {/* <ProviderButton
            onClick={makeLoginWithFn('facebook')}
            disabled={isAuthenticating}
          >
            <FacebookIcon />
            {`Ingresar con Facebook`}
          </ProviderButton> */}
        </div>
      </div>

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
  )
}

export default function SocialLoginButtons(props) {
  return (
    <Suspense>
      <BaseComponent {...props} />
    </Suspense>
  )
}

const ProviderButton = ({ children, ...props }) => {
  return (
    <button
      {...props}
      type='button'
      className='flex flex-row items-center py-2 px-5 bg-white hover:bg-gray-200 text-gray-800 text-sm xs:text-base sm:text-lg font-medium shadow-md border border-gray-300 rounded-lg max-w-xs'
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
