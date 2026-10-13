"use server"

import { db } from "../_lib/prisma"

interface CreateBookingParams {
  userId: string
  serviceId: string
  date: Date
}

export const createBooking = async ({
  userId,
  serviceId,
  date,
}: CreateBookingParams) => {
  if (!userId || !serviceId) {
    throw new Error("Usuário e serviço são obrigatórios.")
  }

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("A data do agendamento é inválida.")
  }

  if (date <= new Date()) {
    throw new Error("Escolha uma data e horário futuros.")
  }

  return db.booking.create({
    data: {
      userId,
      serviceId,
      date,
    },
  })
}
