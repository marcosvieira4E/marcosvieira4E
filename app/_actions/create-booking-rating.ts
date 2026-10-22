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

  // Impede a mesma pessoa de confirmar outro serviço no mesmo instante,
  // mesmo que seja em outra barbearia.
  const existingUserBooking = await db.booking.findFirst({
    where: {
      userId: authenticatedUserId,
      date,
      status: "CONFIRMED",
    },
    select: { id: true },
  })

  if (existingUserBooking) {
    throw new Error(
      "Você já tem um agendamento confirmado nesse horário. Escolha outro.",
    )
  }

  // Impede que duas pessoas reservem o mesmo serviço no mesmo horário.
  const existingServiceBooking = await db.booking.findFirst({
    where: {
      serviceId,
      date,
      status: "CONFIRMED",
    },
    select: { id: true },
  })

  if (existingServiceBooking) {
    throw new Error("Esse horário já foi reservado. Escolha outro.")
  }

  try {
    const booking = await db.booking.create({
      data: {
        userId: authenticatedUserId,
        serviceId,
        date,
        status: "CONFIRMED",
      },
    })

    revalidatePath("/barbershops/[id]", "page")
    revalidatePath("/bookings")
    revalidatePath("/")

    return booking
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error(
        "Esse horário acabou de ser reservado. Atualize os horários e escolha outro.",
      )
    }

    throw error
  }
}
