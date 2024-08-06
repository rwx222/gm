import SidebarMenuList from '@/components/Sidebar/SidebarMenuList/SidebarMenuList'

export default function Sidebar({ children }) {
  return (
    <div className='drawer xl:drawer-open'>
      <input
        id='main-layout-drawer'
        type='checkbox'
        className='drawer-toggle'
      />

      <div className='drawer-content'>{children}</div>

      <div className='drawer-side'>
        <label
          htmlFor='main-layout-drawer'
          aria-label='close sidebar'
          className='drawer-overlay'
        />

        <SidebarMenuList />
      </div>
    </div>
  )
}
