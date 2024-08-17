export default function StandardLayoutWrapper({ children }) {
  return (
    <div className='mx-auto max-w-[700px] xl:max-w-[1024px] xl:border-x-2 xl:border-primary'>
      {children}
    </div>
  )
}
