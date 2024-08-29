export default function FieldLabel({ children }) {
  return (
    <div className='pb-1 text-xs xs:text-base min-h-5 sm:min-h-7 font-normal w-full whitespace-nowrap overflow-hidden overflow-ellipsis'>
      {children}
    </div>
  )
}
