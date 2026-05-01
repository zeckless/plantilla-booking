import { prisma } from "@/lib/prisma"
import { getBusinessSettings } from "@/lib/business-settings"
import BookingFlowFull from "@/components/booking/BookingFlowFull"

export default async function ReservarPage() {
  const [services, settings] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    }),
    getBusinessSettings(),
  ])

  return <BookingFlowFull services={services} businessName={settings.name} />
}
