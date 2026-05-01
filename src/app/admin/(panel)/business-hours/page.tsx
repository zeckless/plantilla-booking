import { prisma } from "@/lib/prisma"
import BusinessHoursForm from "@/components/admin/BusinessHoursForm"

export default async function AdminBusinessHoursPage() {
  const hours = await prisma.businessHours.findMany({
    orderBy: { weekday: "asc" },
  })

  return (
    <BusinessHoursForm
      initial={hours.map((h) => ({
        weekday: h.weekday,
        isOpen: h.isOpen,
        openTime: h.openTime,
        closeTime: h.closeTime,
      }))}
    />
  )
}
