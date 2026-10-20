"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"

import { authOptions } from "../_lib/auth-options"
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
  const session = await getServerSession(authOptions)
  const authenticatedUserId = session?.user?.id

  if (!authenticatedUserId) {
    throw new Error("Usuário não autenticado. Faça login para continuar.")
  }

  if (authenticatedUserId !== userId) {
    throw new Error("Usuário não autorizado.")
  }

  if (!serviceId) {
    throw new Error("O serviço é obrigatório.")
  }

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("A data ou o horário são inválidos.")
  }

  if (date <= new Date()) {
    throw new Error("Escolha uma data e um horário futuros.")
  }

  try {
    const booking = await db.booking.create({
      data: {
        userId: authenticatedUserId,
        serviceId,
        date,
      },
    })

    revalidatePath("/barbershops/[id]", "page")

    return booking
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Esse horário já foi reservado. Escolha outro.")
    }

    throw error
  }
}
