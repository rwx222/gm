import TopNavbar from '@/components/TopNavbar/TopNavbar'
import Sidebar from '@/components/Sidebar/Sidebar'
import StandardLayoutWrapper from '@/ui/StandardLayoutWrapper'

export const dynamic = 'force-dynamic'

export default function HomeLayout({ children }) {
  return (
    <StandardLayoutWrapper>
      <TopNavbar />
      <Sidebar>{children}</Sidebar>
    </StandardLayoutWrapper>
  )
}
