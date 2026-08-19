import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex w-full flex-col bg-white">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 px-4 bg-white/50 backdrop-blur-md">
          <SidebarTrigger className="text-slate-500 hover:text-black" />
          <div className="w-px h-4 bg-slate-200 mx-2" />
          <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Dashboard</span>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}


