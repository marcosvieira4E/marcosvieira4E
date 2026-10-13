"use server"

import { getServerSession } from "next-auth"

import { db } from "@/app/_lib/prisma"
import { authOptions } from "@/app/_lib/auth-options"

interface CreateBookingParams {
  serviceId: string
  date: Date
}

export const createBooking = async ({
  serviceId,
  date,
}: CreateBookingParams) => {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("Faça login para confirmar o agendamento.")
  }

  if (!serviceId) {
    throw new Error("O serviço é obrigatório.")
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
