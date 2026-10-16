"use server"

import { Prisma } from "@prisma/client"
import { getServerSession } from "next-auth"

import { db } from "../_lib/prisma"
import { authOptions } from "../_lib/auth-options"

interface CreateBookingParams {
  serviceId: string
  date: Date
}

export const createBooking = async ({
  serviceId,
  date,
}: CreateBookingParams) => {
  if (!serviceId) {
    throw new Error("O serviço é obrigatório.")
  }

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("A data ou o horário são inválidos.")
  }

  if (date <= new Date()) {
    throw new Error("Escolha uma data e um horário futuros.")
  }

  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("Faça login para confirmar o agendamento.")
  }

  try {
    return await db.booking.create({
      data: {
        userId,
        serviceId,
        date,
      },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Esse horário acabou de ser reservado. Escolha outro.")
    }

    throw error
  }
}
