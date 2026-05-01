import AdminSidebar from "@/components/admin/AdminSidebar"

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[100dvh] bg-canvas">
      <AdminSidebar />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto p-8 md:p-12">{children}</div>
      </main>
    </div>
  )
}
