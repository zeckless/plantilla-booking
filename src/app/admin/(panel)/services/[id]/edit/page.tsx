import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ServiceForm from "@/components/admin/ServiceForm"

export default async function AdminEditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [service, allServices] = await Promise.all([
    prisma.service.findUnique({ where: { id } }),
    prisma.service.findMany({ select: { category: true } }),
  ])
  if (!service) notFound()

  const categories = [...new Set(
    allServices.map((s) => s.category).filter(Boolean) as string[]
  )]

  return (
    <ServiceForm
      mode="edit"
      existingCategories={categories}
      initial={{
        id: service.id,
        name: service.name,
        description: service.description ?? "",
        category: service.category ?? "",
        duration: service.duration,
        price: service.price,
        deposit: service.deposit,
        imageUrl: service.imageUrl ?? "",
        isActive: service.isActive,
      }}
    />
  )
}
