'use client'
/* eslint-disable @next/next/no-img-element */
import 'react-easy-crop/react-easy-crop.css'
import { Suspense, useCallback, useState, useEffect, useRef } from 'react'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import classNames from 'classnames'
import { isNonEmptyString } from 'ramda-adjunct'
import Cropper from 'react-easy-crop'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  browserSessionPersistence,
  onAuthStateChanged,
  signInWithCustomToken,
} from 'firebase/auth'
import {
  getFirestore,
  addDoc,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useRouter } from 'next/navigation'

import {
  REGEX_USER_PHONE,
  REGEX_USER_USERNAME,
  FIELD_PHONE_MAX_LENGTH,
  FIELD_NAME_MIN_LENGTH,
  FIELD_NAME_MAX_LENGTH,
  FIELD_USERNAME_MIN_LENGTH,
  FIELD_USERNAME_MAX_LENGTH,
  EVENT_REFRESH_AVATAR_DATA,
} from '@/constants'
import revalidatePathAction from '@/actions/revalidatePathAction'
import firebaseConfig from '@/data/firebaseConfig'
import EmailIcon from '@/icons/EmailIcon'
import ChevronsLeftRightEllipsisIcon from '@/icons/ChevronsLeftRightEllipsisIcon'
import Trash2Icon from '@/icons/Trash2Icon'
import IdCardIcon from '@/icons/IdCardIcon'
import ImageIcon from '@/icons/ImageIcon'
import SmartphoneIcon from '@/icons/SmartphoneIcon'
import FieldErrorLabel from '@/ui/FieldErrorLabel'
import BasicModalDialog from '@/ui/BasicModalDialog'
import getAvatarUrlFromName from '@/utils/getAvatarUrlFromName'
import getCroppedImage from '@/utils-front/getCroppedImage'

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

const USER_PHOTO_MAX_SIZE_IN_MB = 5
const UPLOAD_USER_PHOTO_INPUT_ID = 'upload_user_photo_input_id'
const MODAL_ID_UNKNOWN_ERROR = 'edit_profile_unknown_error_modal_id'
const MODAL_ID_CONFIRM_DELETE_PHOTO = 'confirm_delete_photo_modal_id'
const MODAL_ID_USER_PHOTO_MAX_SIZE_ERROR = 'user_photo_max_size_error_modal_id'

function BaseComponent({ userData }) {
  const customTokenRef = useRef(userData?.ct)
  const authRef = useRef(null)
  const dbRef = useRef(null)
  const storageRef = useRef(null)
  const croppedImageBlobRef = useRef(null)
  const croppedAreaPixelsRef = useRef(null)

  const [isLoading, setIsLoading] = useState(false)
  const [originUrl, setOriginUrl] = useState('')
  const [tempImageUrlToCrop, setTempImageUrlToCrop] = useState('')
  const [zoom, setZoom] = useState(1)
  const [crop, setCrop] = useState({ x: 0, y: 0 })

  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      photoURL: userData?.photoURL ?? '',
      displayName: userData?.displayName ?? '',
      phoneNumber: userData?.phoneNumber ?? '',
      username: userData?.username ?? '',
    },
  })
  const usernameFieldValue = watch('username')
  const photoURLFieldValue = watch('photoURL')

  const isPhotoInForm = isNonEmptyString(photoURLFieldValue)
  const profilePhotoPreview = isPhotoInForm
    ? photoURLFieldValue
    : getAvatarUrlFromName(userData?.displayName)

  useEffect(() => {
    const app = initializeApp(firebaseConfig)
    authRef.current = getAuth(app)
    dbRef.current = getFirestore(app)
    storageRef.current = getStorage(app)

    authRef.current.setPersistence(browserSessionPersistence)
    authRef.current.useDeviceLanguage()

    const unsubscribe = onAuthStateChanged(authRef.current, (user) => {
      if (!user && customTokenRef.current) {
        signInWithCustomToken(authRef.current, customTokenRef.current)
          .then(() => true)
          .catch((error) => {
            console.error(error)
            console.error(`💥> ASC '${error?.message}'`)
            document.getElementById(MODAL_ID_UNKNOWN_ERROR).showModal()
          })
      }
    })

    setOriginUrl(window.location.origin)

    return () => {
      unsubscribe()
    }
  }, [])

  const onSubmitProfile = useCallback(
    async (formData) => {
      try {
        setIsLoading(true)
        const uid = userData?.uid
        const q = query(
          collection(dbRef.current, 'users'),
          where('username', '==', formData.username)
        )
        const querySnap = await getDocs(q)
        const logUserArr = []
        const foundUids = querySnap.docs.map((doc) => {
          logUserArr.push({
            ...doc.data(),
            _uid: doc.id,
            _loggedAt: serverTimestamp(),
          })
          return doc.id
        })

        if (
          foundUids.length === 0 ||
          (foundUids.length === 1 && foundUids[0] === uid)
        ) {
          let photoURL = formData.photoURL
          const profilePhotoRef = ref(
            storageRef.current,
            'user/' + uid + '/profile/photo.jpg'
          )
          if (croppedImageBlobRef.current) {
            await uploadBytes(profilePhotoRef, croppedImageBlobRef.current)
            photoURL = await getDownloadURL(profilePhotoRef)
          }

          const userPayload = {
            photoURL,
            username: formData.username,
            displayName: formData.displayName,
            phoneNumber: formData.phoneNumber,
          }

          const userDocRef = doc(dbRef.current, 'users', uid)

          let logPayload = null
          if (foundUids.length === 1) {
            logPayload = logUserArr[0]
          } else {
            const currentUserDocSnap = await getDoc(userDocRef)
            logPayload = {
              ...currentUserDocSnap.data(),
              _uid: currentUserDocSnap.id,
              _loggedAt: serverTimestamp(),
            }
          }
          addDoc(collection(dbRef.current, 'log_users'), logPayload)
            .then(() => true)
            .catch(console.error)

          await setDoc(userDocRef, userPayload, { merge: true })

          await revalidatePathAction(`/u/${userData?.username}`)
            .then(() => true)
            .catch(console.error)

          window.dispatchEvent(new CustomEvent(EVENT_REFRESH_AVATAR_DATA))

          router.push(`/u/${userPayload.username}`)
        } else {
          setIsLoading(false)
          setError(
            'username',
            {
              type: 'custom',
              message: 'Este link no esta disponible',
            },
            {
              shouldFocus: true,
            }
          )
        }
      } catch (error) {
        console.error(error)
        console.error(`💥> OSP '${error?.message}'`)
        document.getElementById(MODAL_ID_UNKNOWN_ERROR).showModal()
        setIsLoading(false)
      }
    },
    [router, setError, userData?.uid, userData?.username]
  )

  const removePreviewPhoto = useCallback(() => {
    croppedImageBlobRef.current = null
    setValue('photoURL', '')
    document.getElementById(MODAL_ID_CONFIRM_DELETE_PHOTO).close()
  }, [setValue])

  const cropImage = useCallback(async () => {
    try {
      croppedImageBlobRef.current = null
      const newCroppedImageBlob = await getCroppedImage(
        tempImageUrlToCrop,
        croppedAreaPixelsRef.current
      )

      croppedImageBlobRef.current = newCroppedImageBlob
      setValue('photoURL', URL.createObjectURL(newCroppedImageBlob))
      setTempImageUrlToCrop('')
    } catch (error) {
      console.error(error)
      console.error(`💥> HCI '${error?.message}'`)
      document.getElementById(MODAL_ID_UNKNOWN_ERROR).showModal()
    }
  }, [tempImageUrlToCrop, setValue])

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    croppedAreaPixelsRef.current = croppedAreaPixels
  }, [])

  return (
    <div className='relative pb-10'>
      <section className='flex justify-center items-center gap-3 pt-3 pb-5'>
        <button
          type='button'
          className='btn btn-circle'
          title='Eliminar foto'
          disabled={isLoading || !isPhotoInForm}
          onClick={() => {
            if (isPhotoInForm) {
              document.getElementById(MODAL_ID_CONFIRM_DELETE_PHOTO).showModal()
            }
          }}
        >
          <Trash2Icon />
        </button>

        <div className='avatar'>
          <div className='ring-primary ring-offset-base-100 w-24 rounded-full ring ring-offset-2'>
            <img alt='Foto de usuario' src={profilePhotoPreview} />
          </div>
        </div>

        <button
          type='button'
          className='btn btn-circle'
          title='Subir foto'
          disabled={isLoading}
          onClick={() => {
            croppedAreaPixelsRef.current = null
            setZoom(1)
            setCrop({ x: 0, y: 0 })
            document.getElementById(UPLOAD_USER_PHOTO_INPUT_ID).value = ''
            document.getElementById(UPLOAD_USER_PHOTO_INPUT_ID).click()
          }}
        >
          <ImageIcon width='24' height='24' />
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
            {originUrl && (
              <>
                {originUrl + '/u/'}
                <span className='font-normal'>
                  {usernameFieldValue.toLowerCase()}
                </span>
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

      {isNonEmptyString(tempImageUrlToCrop) && (
        <div className='bg-base-100 absolute top-0 bottom-0 left-0 right-0'>
          <div className='absolute left-0 right-0 top-0 bottom-20'>
            <Cropper
              aspect={1}
              image={tempImageUrlToCrop}
              crop={crop}
              zoom={zoom}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              disableAutomaticStylesInjection
              cropShape='round'
            />
          </div>

          <div className='h-20 absolute bottom-0 left-0 right-0 xs:px-5 flex flex-col justify-center gap-3'>
            <input
              type='range'
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              aria-labelledby='Zoom'
              className='range range-secondary range-xs'
            />

            <div className='flex justify-center gap-5'>
              <button
                type='button'
                onClick={() => setTempImageUrlToCrop('')}
                className='btn btn-neutral btn-sm min-w-28 xs:text-lg'
              >{`Cancelar`}</button>
              <button
                type='button'
                onClick={cropImage}
                className='btn btn-secondary btn-sm min-w-28 xs:text-lg'
              >{`Listo`}</button>
            </div>
          </div>
        </div>
      )}

      <input
        id={UPLOAD_USER_PHOTO_INPUT_ID}
        type='file'
        className='hidden'
        accept='image/*'
        onChange={(e) => {
          try {
            const file = e.target.files[0]

            if (file) {
              const fileMaxSizeInBytes = 1024 * 1024 * USER_PHOTO_MAX_SIZE_IN_MB

              if (file.size > fileMaxSizeInBytes) {
                document
                  .getElementById(MODAL_ID_USER_PHOTO_MAX_SIZE_ERROR)
                  .showModal()
              } else {
                setTempImageUrlToCrop(URL.createObjectURL(file))
              }
            }
          } catch (error) {
            console.error(error)
            console.error(`💥> FIC '${error?.message}'`)
            document.getElementById(MODAL_ID_UNKNOWN_ERROR).showModal()
          }
        }}
      />

      <ModalsSection>
        <BasicModalDialog
          id={MODAL_ID_CONFIRM_DELETE_PHOTO}
          title='Eliminar Foto'
          description='¿Deseas eliminar tu foto de perfil?'
          closeText='Cancelar'
          afterCloseContent={
            <button
              type='button'
              onClick={removePreviewPhoto}
              className='btn btn-error'
            >
              {`Si, eliminar`}
            </button>
          }
        />
      </ModalsSection>
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

const ModalsSection = ({ children }) => {
  return (
    <section>
      <BasicModalDialog
        id={MODAL_ID_UNKNOWN_ERROR}
        title={`Error Inesperado`}
        description={`Ha ocurrido un error inesperado. Por favor, intenta otra vez.`}
      />

      <BasicModalDialog
        id={MODAL_ID_USER_PHOTO_MAX_SIZE_ERROR}
        title={`Tamaño De Archivo`}
        description={`La imagen supera el tamaño maximo de ${
          USER_PHOTO_MAX_SIZE_IN_MB - 2
        } MB.`}
      />

      {children}
    </section>
  )
}
