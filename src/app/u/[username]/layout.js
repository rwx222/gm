import TopNavbar from '@/components/TopNavbar/TopNavbar'
import Sidebar from '@/components/Sidebar/Sidebar'

export const dynamic = 'force-static'

export default function ULayout({ children }) {
  return (
    <div className='mx-auto max-w-[700px] xl:max-w-[1024px] xl:border-x-2 xl:border-primary'>
      <TopNavbar />
      <Sidebar>{children}</Sidebar>
    </div>
  )
}
