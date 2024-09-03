export default function BasicModalDialog({
  id,
  title,
  description,
  closeText = 'Cerrar',
  afterCloseContent,
}) {
  return (
    <dialog id={id} className='modal modal-bottom sm:modal-middle'>
      <div className='modal-box'>
        <h3 className='font-bold text-lg'>{title}</h3>

        <div className='py-4'>{description}</div>

        <div className='modal-action'>
          <form method='dialog'>
            <button type='submit' className='btn text-lg'>
              {closeText}
            </button>
          </form>

          {afterCloseContent}
        </div>
      </div>
    </dialog>
  )
}
