import TopNavbar from '@/components/TopNavbar/TopNavbar'
import Sidebar from '@/components/Sidebar/Sidebar'
import StandardLayoutWrapper from '@/ui/StandardLayoutWrapper'

export const dynamic = 'force-static'

export default function ULayout({ children }) {
  return (
    <StandardLayoutWrapper>
      <TopNavbar />
      <Sidebar>{children}</Sidebar>
    </StandardLayoutWrapper>
  )
}
