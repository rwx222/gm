export default function RecaptchaPolicyLabel() {
  return (
    <div className='text-xs leading-4 pt-3'>
      {`This site is protected by reCAPTCHA and the Google `}
      <a
        target='_blank'
        href='https://policies.google.com/privacy'
        className='link'
      >{`Privacy Policy`}</a>
      {` and `}
      <a
        target='_blank'
        href='https://policies.google.com/terms'
        className='link'
      >
        {`Terms of Service`}
      </a>
      {` apply.`}
    </div>
  )
}
