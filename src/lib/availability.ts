import { addMinutes, isSameDay, startOfDay } from "date-fns"

export interface BusinessHourEntry {
  weekday: number
  isOpen: boolean
  openTime: string
  closeTime: string
}

export interface AppointmentEntry {
  date: Date
  duration: number
}

interface SlotsArgs {
  date: Date
  serviceDuration: number
  businessHours: BusinessHourEntry[]
  appointments: AppointmentEntry[]
  step?: number
  now?: Date
  bufferMinutes?: number
}

function parseHHmm(s: string): number {
  const [h, m] = s.split(":").map(Number)
  return h * 60 + m
}

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

export function getAvailableSlots(args: SlotsArgs): string[] {
  const step = args.step ?? 30
  const bufferMinutes = args.bufferMinutes ?? 30
  const now = args.now ?? new Date()

  const weekday = args.date.getDay()
  const bh = args.businessHours.find((b) => b.weekday === weekday)
  if (!bh || !bh.isOpen) return []

  const openMin = parseHHmm(bh.openTime)
  const closeMin = parseHHmm(bh.closeTime)

  const candidates: number[] = []
  for (let t = openMin; t + args.serviceDuration <= closeMin; t += step) {
    candidates.push(t)
  }

  const dayStart = startOfDay(args.date)
  const slotDates = candidates.map((t) => addMinutes(dayStart, t))

  const minTime = isSameDay(args.date, now)
    ? addMinutes(now, bufferMinutes)
    : dayStart

  const overlaps = (slotStart: Date) => {
    const slotEnd = addMinutes(slotStart, args.serviceDuration)
    return args.appointments.some((a) => {
      const aEnd = addMinutes(a.date, a.duration)
      return slotStart < aEnd && slotEnd > a.date
    })
  }

  return slotDates
    .filter((d) => d >= minTime)
    .filter((d) => !overlaps(d))
    .map((d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`)
}
