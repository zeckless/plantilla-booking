import { create } from 'zustand'

export interface BookingService {
  id: string
  name: string
  description: string | null
  category: string | null
  duration: number
  price: number
  deposit: number
  imageUrl: string | null
}

export interface ContactInfo {
  name: string
  lastName: string
  rut: string
  email: string
  phone: string
  notes?: string
}

interface BookingState {
  selectedService: BookingService | null
  selectedDate: Date | null
  selectedTime: string | null
  contactInfo: ContactInfo | null

  setService: (service: BookingService) => void
  setDate: (date: Date) => void
  setTime: (time: string) => void
  setContactInfo: (info: ContactInfo) => void
  clearBooking: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedService: null,
  selectedDate: null,
  selectedTime: null,
  contactInfo: null,

  setService: (service) => set({ selectedService: service, selectedDate: null, selectedTime: null }),
  setDate: (date) => set({ selectedDate: date, selectedTime: null }),
  setTime: (time) => set({ selectedTime: time }),
  setContactInfo: (info) => set({ contactInfo: info }),
  clearBooking: () => set({ selectedService: null, selectedDate: null, selectedTime: null, contactInfo: null }),
}))
