import { prisma } from "@/lib/prisma"
import ServiceForm from "@/components/admin/ServiceForm"

export default async function AdminNewServicePage() {
  const services = await prisma.service.findMany({ select: { category: true } })
  const categories = [...new Set(
    services.map((s) => s.category).filter(Boolean) as string[]
  )]

  return <ServiceForm mode="create" existingCategories={categories} />
}
