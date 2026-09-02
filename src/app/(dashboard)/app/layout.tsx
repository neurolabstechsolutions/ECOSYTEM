import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { GlobalAICopilot } from "@/components/global-ai-copilot"
import { WhatsAppQRButton } from "@/components/whatsapp-qr-button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex w-full flex-col bg-white">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200/80 px-3 sm:px-5 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="text-zinc-500 hover:text-zinc-900 h-8 w-8 rounded-lg hover:bg-zinc-100" />
            <div className="w-px h-4 bg-zinc-200 mx-1.5 hidden sm:block" />
            <span className="text-xs font-semibold text-zinc-600 tracking-wide uppercase">Panel Central</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* WhatsApp QR scanner button accessible to the admin on all pages */}
            <WhatsAppQRButton variant="header" />

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 pl-2 border-l border-zinc-200">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">Sistema Activo</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
      <GlobalAICopilot />
    </SidebarProvider>
  )
}
