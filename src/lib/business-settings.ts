import { prisma } from "./prisma"

export async function getBusinessSettings() {
  let settings = await prisma.businessSettings.findFirst()
  if (!settings) {
    settings = await prisma.businessSettings.create({
      data: { name: "Barbería & Estética" },
    })
  }
  return settings
}
