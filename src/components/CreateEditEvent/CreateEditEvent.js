'use client'
import 'react-easy-crop/react-easy-crop.css'
import {
  Suspense,
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import classNames from 'classnames'
import { omit } from 'ramda'
import { isNonEmptyString } from 'ramda-adjunct'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  inMemoryPersistence,
} from 'firebase/auth'
import {
  getFirestore,
  addDoc,
  doc,
  updateDoc,
  collection,
  serverTimestamp,
  // writeBatch, // TODO: -> use this writeBatch
} from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useRouter } from 'next/navigation'
import Cropper from 'react-easy-crop'
import ImageCompressor from 'js-image-compressor'
import toast from 'react-hot-toast'

import {
  FN_PATH_EVENT_PAGE,
  EVENT_SIGN_OUT_SIGNAL,
  SS_KEY_SAVED_EVENT,
} from '@/constants'
import revalidatePathAction from '@/actions/revalidatePathAction'
import getCustomTokenAction from '@/actions/getCustomTokenAction'
import normalizeSpaces from '@/utils/normalizeSpaces'
import firebaseConfig from '@/data/firebaseConfig'
import BasicModalDialog from '@/ui/BasicModalDialog'
import FieldLabel from '@/ui/FieldLabel'
import FieldErrorLabel from '@/ui/FieldErrorLabel'
import StandardCropperWrapper from '@/ui/StandardCropperWrapper'
import getCroppedImage from '@/utils-front/getCroppedImage'
import ImageIcon from '@/icons/ImageIcon'
import Trash2Icon from '@/icons/Trash2Icon'
import normalizeForSearch from '@/utils/normalizeForSearch'
import getUsernameFromEmail from '@/utils/getUsernameFromEmail'
import { deobfuscateText } from '@/utils/obfuscation'

// TODO: -> put min max values as constants
const schema = yup
  .object({
    name: yup
      .string()
      .trim()
      .required('Campo requerido')
      .min(1, 'Mínimo ${min} caracteres')
      .max(60, 'Máximo ${max} caracteres'),
    description: yup.string().trim().max(200, 'Máximo ${max} caracteres'),
    eventType: yup.string().trim().required('Campo requerido'),
    bannerUrl: yup.string().trim().required('Campo requerido'),
    isPublished: yup.bool(),
  })
  .required()

const EVENT_BANNER_MAX_SIZE_IN_MB = 7
const UPLOAD_BANNER_INPUT_ID = 'upload_event_banner_input_id'
const MODAL_ID_UNKNOWN_ERROR = 'create_event_unknown_error_modal_id'
const MODAL_ID_EVENT_BANNER_MAX_SIZE_ERROR =
  'event_banner_max_size_error_modal_id'
const MODAL_ID_BACKGROUND_SIGN_IN_ERROR = 'blsiwct_create_event_error_modal_id'
const MODAL_ID_CONFIRM_DELETE_BANNER = 'confirm_delete_banner_modal_id'

const getBannerPath = (uid) => {
  return 'event/' + uid + '/page/banner.jpg'
}

function BaseComponent({ eventTypes, userUid, eventData, osus }) {
  const allowBackgroundSignIn = useRef(true)
  const authRef = useRef(null)
  const dbRef = useRef(null)
  const storageRef = useRef(null)
  const compressedCroppedImageBlobRef = useRef(null)
  const croppedAreaPixelsRef = useRef(null)

  const [isLoading, setIsLoading] = useState(false)
  const [signingInBackground, setSigningInBackground] = useState(false)
  const [tempImageUrlToCrop, setTempImageUrlToCrop] = useState('')
  const [zoom, setZoom] = useState(1)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [searchUserText, setSearchUserText] = useState('')

  const router = useRouter()
  const eventUid = eventData?.uid

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: eventData?.name ?? '',
      description: eventData?.description ?? '',
      eventType: eventData?.eventType ?? '',
      bannerUrl: eventData?.bannerUrl ?? '',
      isPublished: eventData?.isPublished ?? true,
    },
  })
  const bannerUrlFieldValue = watch('bannerUrl')
  const isPublishedFieldValue = watch('isPublished')

  const isThereABanner = isNonEmptyString(bannerUrlFieldValue)

  useEffect(() => {
    function handleSignOutSignal() {
      allowBackgroundSignIn.current = false
    }

    window.addEventListener(EVENT_SIGN_OUT_SIGNAL, handleSignOutSignal)

    return () => {
      window.removeEventListener(EVENT_SIGN_OUT_SIGNAL, handleSignOutSignal)
    }
  }, [])

  useEffect(() => {
    const app = initializeApp(firebaseConfig)
    authRef.current = getAuth(app)
    dbRef.current = getFirestore(app)
    storageRef.current = getStorage(app)

    authRef.current.setPersistence(inMemoryPersistence)
    authRef.current.useDeviceLanguage()

    const unsubscribe = onAuthStateChanged(authRef.current, (user) => {
      if (!user && allowBackgroundSignIn.current) {
        setSigningInBackground(true)
        getCustomTokenAction()
          .then((customToken) => {
            return signInWithCustomToken(authRef.current, customToken)
          })
          .then(() => setSigningInBackground(false))
          .catch((error) => {
            console.error(error)
            console.error(`💥> ASC '${error?.message}'`)
            document
              .getElementById(MODAL_ID_BACKGROUND_SIGN_IN_ERROR)
              .showModal()
          })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const searchableUsers = useMemo(() => {
    try {
      const searchableUsersJsonString = deobfuscateText(osus)
      const resArr = JSON.parse(searchableUsersJsonString)
      return resArr
    } catch (error) {
      console.error(error)
      console.error(`💥> DSU '${error?.message}'`)
      return []
    }
  }, [osus])

  const searchUserResults = useMemo(() => {
    // TODO: -> use https://github.com/downshift-js/downshift
    const cleanSearchText = normalizeForSearch(
      getUsernameFromEmail(searchUserText)
    )

    if (cleanSearchText.length >= 2) {
      return searchableUsers.filter((u) => u._s.includes(cleanSearchText))
    }
    return []
  }, [searchUserText, searchableUsers])

  const onSubmit = useCallback(
    async (formData) => {
      try {
        setIsLoading(true)
        let finalEventId = ''

        if (eventUid) {
          finalEventId = eventUid
          let bannerUrl = formData.bannerUrl

          if (compressedCroppedImageBlobRef.current) {
            const eventBannerRef = ref(
              storageRef.current,
              getBannerPath(eventUid)
            )
            await uploadBytes(
              eventBannerRef,
              compressedCroppedImageBlobRef.current
            )
            bannerUrl = await getDownloadURL(eventBannerRef)
          }

          const logPayload = {
            ...omit(['uid'], eventData),
            _uid: eventUid,
            _loggedAt: serverTimestamp(),
          }
          addDoc(collection(dbRef.current, 'log_events'), logPayload)
            .then(() => true)
            .catch((error) => {
              console.error(error)
              console.error(`💥> ALE '${error?.message}'`)
            })

          const eventDocRef = doc(dbRef.current, 'events', eventUid)
          const eventPayload = {
            name: normalizeSpaces(formData.name),
            description: normalizeSpaces(formData.description),
            eventType: formData.eventType,
            isPublished: formData.isPublished,
            bannerUrl,
          }
          await updateDoc(eventDocRef, eventPayload)
        } else {
          const eventPayload = {
            name: normalizeSpaces(formData.name),
            description: normalizeSpaces(formData.description),
            eventType: formData.eventType,
            isPublished: formData.isPublished,
            bannerUrl: '',
            ownerUid: userUid,
          }

          const newEventDocRef = await addDoc(
            collection(dbRef.current, 'events'),
            eventPayload
          )
          const newEventUid = newEventDocRef.id
          finalEventId = newEventUid
          let bannerUrl = ''

          if (compressedCroppedImageBlobRef.current) {
            const eventBannerRef = ref(
              storageRef.current,
              getBannerPath(newEventUid)
            )
            await uploadBytes(
              eventBannerRef,
              compressedCroppedImageBlobRef.current
            )
            bannerUrl = await getDownloadURL(eventBannerRef)
          }
          await updateDoc(newEventDocRef, { bannerUrl })
        }

        await revalidatePathAction(FN_PATH_EVENT_PAGE(finalEventId))
          .then(() => true)
          .catch((error) => {
            console.error(error)
            console.error(`💥> RPA '${error?.message}'`)
          })

        sessionStorage.setItem(SS_KEY_SAVED_EVENT, 'done')

        router.push(FN_PATH_EVENT_PAGE(finalEventId))
      } catch (error) {
        console.error(error)
        console.error(`💥> OSF '${error?.message}'`)
        document.getElementById(MODAL_ID_UNKNOWN_ERROR).showModal()
        setIsLoading(false)
      }
    },
    [eventData, eventUid, router, userUid]
  )

  const cropAndCompressImage = useCallback(async () => {
    try {
      compressedCroppedImageBlobRef.current = null
      const newCroppedImageBlob = await getCroppedImage(
        tempImageUrlToCrop,
        croppedAreaPixelsRef.current
      )
      setTempImageUrlToCrop('')

      const compressionOptions = {
        file: newCroppedImageBlob,
        maxWidth: 720,
        maxHeight: 308,
        quality: 0.9,
        success: (compressedFile) => {
          compressedCroppedImageBlobRef.current = compressedFile
          setValue('bannerUrl', URL.createObjectURL(compressedFile), {
            shouldValidate: true,
          })
        },
        error: (msg) => {
          console.error(`💥> CIE`, msg)
          setValue('bannerUrl', '')

          toast.error('Error al procesar la imagen', {
            duration: 5000,
            className: '!bg-error !text-error-content',
            icon: '⛔',
          })
        },
      }
      new ImageCompressor(compressionOptions)
    } catch (error) {
      console.error(error)
      console.error(`💥> HCI '${error?.message}'`)
      document.getElementById(MODAL_ID_UNKNOWN_ERROR).showModal()
    }
  }, [setValue, tempImageUrlToCrop])

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    croppedAreaPixelsRef.current = croppedAreaPixels
  }, [])

  const removePreviewBanner = useCallback(() => {
    compressedCroppedImageBlobRef.current = null
    setValue('bannerUrl', '')
    document.getElementById(MODAL_ID_CONFIRM_DELETE_BANNER).close()
  }, [setValue])

  const openUploadFilePicker = useCallback(() => {
    croppedAreaPixelsRef.current = null
    setZoom(1)
    setCrop({ x: 0, y: 0 })
    document.getElementById(UPLOAD_BANNER_INPUT_ID).value = ''
    document.getElementById(UPLOAD_BANNER_INPUT_ID).click()
  }, [])

  return (
    <div className='relative pb-10'>
      <section>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='mb-5'>
            <FieldLabel>{`* Nombre del evento`}</FieldLabel>
            <label
              className={classNames(
                'input input-bordered text-lg flex items-center gap-2',
                {
                  'input-accent': !errors?.name,
                  'input-error': errors?.name,
                }
              )}
            >
              <input
                type='text'
                className='grow'
                placeholder='* Nombre del evento'
                disabled={isLoading}
                {...register('name')}
              />
            </label>
            {errors?.name && (
              <FieldErrorLabel>{errors?.name?.message}</FieldErrorLabel>
            )}
          </div>

          <div className='mb-5'>
            <FieldLabel>{`Descripción`}</FieldLabel>
            <textarea
              className={classNames('textarea w-full resize-none text-lg', {
                'textarea-accent': !errors?.description,
                'textarea-error': errors?.description,
              })}
              rows={4}
              placeholder='Descripción'
              disabled={isLoading}
              {...register('description')}
            />
            {errors?.description && (
              <FieldErrorLabel>{errors?.description?.message}</FieldErrorLabel>
            )}
          </div>

          <div className='mb-5'>
            <FieldLabel>{`* Tipo de evento`}</FieldLabel>
            <select
              className={classNames('select w-full text-lg', {
                'select-accent': !errors?.eventType,
                'select-error': errors?.eventType,
              })}
              disabled={isLoading}
              {...register('eventType')}
            >
              <option disabled value=''>{`...`}</option>
              {eventTypes.map((type) => {
                return (
                  <option key={type?.uid} value={type?.key}>
                    {type?.name}
                  </option>
                )
              })}
            </select>
            {errors?.eventType && (
              <FieldErrorLabel>{errors?.eventType?.message}</FieldErrorLabel>
            )}
          </div>

          <div className='mb-5'>
            <FieldLabel>{`* Banner (recomendado: 720x308px)`}</FieldLabel>
            <div
              className={classNames('min-h-56', {
                'flex items-center justify-center border': !isThereABanner,
                'border-error': errors?.bannerUrl && !isThereABanner,
                'border-accent': !errors?.bannerUrl && !isThereABanner,
              })}
            >
              {isThereABanner ? (
                <div>
                  <img
                    src={bannerUrlFieldValue}
                    alt='Banner'
                    className='mx-auto border border-accent max-h-56'
                  />
                  <div className='flex justify-center items-center gap-3 py-2'>
                    <button
                      type='button'
                      className='btn btn-circle btn-outline btn-accent'
                      title='Eliminar foto'
                      disabled={isLoading}
                      onClick={() => {
                        document
                          .getElementById(MODAL_ID_CONFIRM_DELETE_BANNER)
                          .showModal()
                      }}
                    >
                      <Trash2Icon width='20' height='20' />
                    </button>

                    <button
                      type='button'
                      className='btn btn-circle btn-outline btn-accent'
                      title='Subir foto'
                      disabled={isLoading || signingInBackground}
                      onClick={openUploadFilePicker}
                    >
                      <ImageIcon />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type='button'
                  className='btn btn-outline btn-accent text-lg'
                  onClick={openUploadFilePicker}
                >
                  <ImageIcon />
                  {`Subir imagen`}
                </button>
              )}
            </div>
            {errors?.bannerUrl && (
              <FieldErrorLabel>{errors?.bannerUrl?.message}</FieldErrorLabel>
            )}
          </div>

          {eventUid && (
            <div className='mb-5 flex justify-end'>
              <label className='label cursor-pointer'>
                <span className='font-normal text-xs xs:text-base pr-3'>
                  {`Publicar`}
                </span>
                <input
                  type='checkbox'
                  className='toggle toggle-accent'
                  disabled={isLoading}
                  checked={isPublishedFieldValue}
                  onChange={(e) => {
                    setValue('isPublished', e.target.checked)
                  }}
                />
              </label>
            </div>
          )}

          <button
            type='submit'
            disabled={isLoading}
            className='btn btn-accent btn-block text-lg'
          >
            {isLoading && <span className='loading loading-spinner' />}
            {eventUid
              ? isPublishedFieldValue
                ? `Guardar`
                : `Pausar evento`
              : `Publicar`}
          </button>
        </form>
      </section>

      {isNonEmptyString(tempImageUrlToCrop) && (
        <StandardCropperWrapper>
          <div className='absolute left-0 right-0 top-0 bottom-20'>
            <Cropper
              aspect={21 / 9}
              image={tempImageUrlToCrop}
              crop={crop}
              zoom={zoom}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              disableAutomaticStylesInjection
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
                onClick={cropAndCompressImage}
                className='btn btn-secondary btn-sm min-w-28 xs:text-lg'
              >{`Listo`}</button>
            </div>
          </div>
        </StandardCropperWrapper>
      )}

      <input
        id={UPLOAD_BANNER_INPUT_ID}
        type='file'
        className='hidden'
        accept='image/*'
        onChange={(e) => {
          const file = e.target.files[0]

          if (file) {
            const fileMaxSizeInBytes = 1024 * 1024 * EVENT_BANNER_MAX_SIZE_IN_MB

            if (file.size > fileMaxSizeInBytes) {
              document
                .getElementById(MODAL_ID_EVENT_BANNER_MAX_SIZE_ERROR)
                .showModal()
            } else {
              setTempImageUrlToCrop(URL.createObjectURL(file))
            }
          }
        }}
      />

      <ModalsSection>
        <BasicModalDialog
          id={MODAL_ID_CONFIRM_DELETE_BANNER}
          title='Eliminar Banner'
          description='¿Deseas eliminar el banner?'
          closeText='Cancelar'
          afterCloseContent={
            <button
              type='button'
              onClick={removePreviewBanner}
              className='btn btn-error text-lg'
            >
              {`Si, eliminar`}
            </button>
          }
        />
      </ModalsSection>
    </div>
  )
}

export default function CreateEditEvent(props) {
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
        id={MODAL_ID_BACKGROUND_SIGN_IN_ERROR}
        title={`Error De Sesión`}
        description={`No es normal, pero ha ocurrido un error con la sesión. Por favor, intenta recargar la página, o cierra sesión e ingresa nuevamente para un correcto funcionamiento.`}
      />

      <BasicModalDialog
        id={MODAL_ID_EVENT_BANNER_MAX_SIZE_ERROR}
        title={`Tamaño De Archivo`}
        description={`La imagen supera el tamaño maximo de ${
          EVENT_BANNER_MAX_SIZE_IN_MB - 1
        } MB.`}
      />

      {children}
    </section>
  )
}
