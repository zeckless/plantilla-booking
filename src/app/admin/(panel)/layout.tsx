import AdminSidebar from "@/components/admin/AdminSidebar"
import { getBusinessSettings } from "@/lib/business-settings"

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getBusinessSettings()

  return (
    <div className="flex min-h-[100dvh] bg-[#f7f6f3]">
      <AdminSidebar businessName={settings.name} />
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto p-6 md:p-10">{children}</div>
      </main>
    </div>
  )
}
