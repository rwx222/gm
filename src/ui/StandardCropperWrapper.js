export default function StandardCropperWrapper({ children }) {
  return (
    <div className='bg-base-100 absolute top-0 bottom-0 left-0 right-0'>
      <div className='relative h-[calc(100dvh-4rem)] max-h-[800px]'>
        {children}
      </div>
    </div>
  )
}
