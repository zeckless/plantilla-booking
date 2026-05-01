import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database for Barbería Booking...')

  // Clear existing
  await prisma.appointment.deleteMany()
  await prisma.service.deleteMany()
  await prisma.user.deleteMany()
  await prisma.businessHours.deleteMany()

  // ─── Business Hours ──────────────────────────────────
  // 0=Domingo, 1=Lunes ... 6=Sabado. Cerrado los domingos.
  const defaultHours = [
    { weekday: 0, isOpen: false, openTime: "09:00", closeTime: "19:00" },
    { weekday: 1, isOpen: true, openTime: "09:00", closeTime: "19:00" },
    { weekday: 2, isOpen: true, openTime: "09:00", closeTime: "19:00" },
    { weekday: 3, isOpen: true, openTime: "09:00", closeTime: "19:00" },
    { weekday: 4, isOpen: true, openTime: "09:00", closeTime: "20:00" },
    { weekday: 5, isOpen: true, openTime: "09:00", closeTime: "20:00" },
    { weekday: 6, isOpen: true, openTime: "10:00", closeTime: "16:00" },
  ]
  for (const h of defaultHours) {
    await prisma.businessHours.create({ data: h })
  }
  console.log(`✅ Horarios de atencion configurados`)

  // ─── Users ───────────────────────────────────────────
  await prisma.user.create({
    data: {
      email: 'admin@barberia.cl',
      name: 'Admin Barbería',
      phone: '+56 9 1111 2222',
      role: 'ADMIN',
    },
  })

  const customer = await prisma.user.create({
    data: {
      email: 'cliente@email.cl',
      name: 'Juan Cliente',
      phone: '+56 9 8765 4321',
      role: 'CUSTOMER',
    },
  })
  console.log(`✅ Usuarios creados`)

  // ─── Services ─────────────────────────────────────────
  const services = [
    {
      name: 'Corte de Cabello Clásico',
      description: 'Corte tradicional con tijera o máquina, incluye lavado y peinado.',
      duration: 45,
      price: 15000,
      deposit: 5000,
      imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600',
    },
    {
      name: 'Perfilado de Barba',
      description: 'Arreglo de barba con navaja, toalla caliente y productos premium.',
      duration: 30,
      price: 10000,
      deposit: 5000,
      imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600',
    },
    {
      name: 'Corte + Barba VIP',
      description: 'El servicio completo. Corte de cabello, perfilado de barba, mascarilla facial y masaje capilar.',
      duration: 75,
      price: 22000,
      deposit: 8000,
      imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600',
    },
    {
      name: 'Limpieza Facial Express',
      description: 'Limpieza profunda de cutis con exfoliación e hidratación.',
      duration: 30,
      price: 12000,
      deposit: 5000,
      imageUrl: 'https://images.unsplash.com/photo-1512496015851-a1dc8a47c591?w=600',
    }
  ]

  for (const s of services) {
    await prisma.service.create({ data: s })
  }
  console.log(`✅ ${services.length} servicios creados`)

  // ─── Appointments (Example) ───────────────────────────
  const firstService = await prisma.service.findFirst()
  if (firstService) {
    // Tomorrow at 10:00 AM
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    await prisma.appointment.create({
      data: {
        date: tomorrow,
        status: 'CONFIRMED',
        paymentStatus: 'DEPOSIT_PAID',
        paymentRef: 'seed_payment_123',
        notes: 'Primera visita',
        userId: customer.id,
        serviceId: firstService.id,
      }
    })
    console.log(`✅ 1 cita de ejemplo agendada para mañana`)
  }

  console.log('🎉 Seed completado!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
