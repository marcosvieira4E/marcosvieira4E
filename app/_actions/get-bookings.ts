"use server"

import { endOfDay, startOfDay } from "date-fns"
import { getServerSession } from "next-auth"

import { authOptions } from "../_lib/auth-options"
import { db } from "../_lib/prisma"

interface GetBookingsParams {
  serviceId: string
  date: Date
}

export const getBookings = async ({ serviceId, date }: GetBookingsParams) => {
  if (!serviceId) {
    throw new Error("O serviço é obrigatório.")
  }

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("A data informada é inválida.")
  }

  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  const dateRange = {
    gte: startOfDay(date),
    lte: endOfDay(date),
  }

  const [serviceBookings, userBookings] = await Promise.all([
    db.booking.findMany({
      where: {
        serviceId,
        status: "CONFIRMED",
        date: dateRange,
      },
      select: { date: true },
    }),
    userId
      ? db.booking.findMany({
          where: {
            userId,
            status: "CONFIRMED",
            date: dateRange,
          },
          select: { date: true },
        })
      : Promise.resolve([]),
  ])

  // Inclui horários ocupados neste serviço e horários já reservados
  // pela pessoa em qualquer outra barbearia.
  const uniqueDates = new Map<number, Date>()

  for (const booking of [...serviceBookings, ...userBookings]) {
    uniqueDates.set(booking.date.getTime(), booking.date)
  }

  return [...uniqueDates.values()]
    .sort((first, second) => first.getTime() - second.getTime())
    .map((bookingDate) => ({ date: bookingDate }))
}
