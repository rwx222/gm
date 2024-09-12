import { forwardRef } from 'react'

const DatePickerCustomInputButton = forwardRef(
  function datepickerCustomInputButton({ children, ...props }, ref) {
    return (
      <button {...props} ref={ref} type='button'>
        {children}
      </button>
    )
  }
)

export default DatePickerCustomInputButton
