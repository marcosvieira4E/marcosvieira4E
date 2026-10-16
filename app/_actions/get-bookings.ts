"use server"

import { endOfDay, startOfDay } from "date-fns"

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

  return db.booking.findMany({
    where: {
      serviceId,
      date: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
    },
    select: {
      date: true,
    },
    orderBy: {
      date: "asc",
    },
  })
}
