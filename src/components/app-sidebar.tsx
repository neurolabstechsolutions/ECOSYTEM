'use client'

import { MOCK_SIDEBAR_LINKS } from '@/lib/mocks'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" className="bg-white border-r border-slate-200 text-slate-900">
      <SidebarHeader className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3 px-2">
          <div className="size-11 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center bg-white border border-slate-100 p-0.5 shrink-0">
            <img src="/neurolabs-logo.jpg" alt="NeuroLabs Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-bold font-serif text-lg tracking-tight text-slate-950">NeuroLabs</span>
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">TECH SOLUTIONS S.A.S.</span>
            <span className="text-[10px] text-emerald-600 font-serif italic">Innovación sin Límites</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 font-medium">Menú Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MOCK_SIDEBAR_LINKS.map((item) => {
                const IconComponent = Icons[item.icon as keyof typeof Icons] as any
                const targetHref = item.path === '/' ? '/app' : `/app${item.path}`
                const isActive = pathname === targetHref || pathname === item.path || pathname.startsWith(targetHref + '/')
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      isActive={isActive} 
                      tooltip={item.name}
                      render={
                        <Link href={targetHref} className={cn(
                          "flex items-center gap-4 transition-colors font-medium rounded-lg text-base py-2.5 px-3",
                          isActive ? "text-slate-900 bg-slate-100 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )} />
                      }
                    >
                      {IconComponent && <IconComponent size={20} />}
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-9 w-9 border border-slate-200 shadow-sm">
            <AvatarImage src="https://i.pravatar.cc/150?u=admin" />
            <AvatarFallback className="bg-slate-100 text-black font-semibold">NL</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-semibold truncate text-black">Dirección General</span>
            <span className="text-xs text-slate-500 truncate">neurolabstechsolutions@gmail.com</span>
          </div>
          <form action="/login" method="GET">
            <button type="submit" className="text-slate-400 hover:text-black transition-colors" title="Cerrar sesión">
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
