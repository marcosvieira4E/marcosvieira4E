"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/_lib/auth-options"
import { db } from "@/app/_lib/prisma"

type CreateBookingRatingParams = {
  bookingId: string
  rating: number
  comment?: string
}

export const createBookingRating = async ({
  bookingId,
  rating,
  comment = "",
}: CreateBookingRatingParams) => {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("Faça login para avaliar o serviço.")
  }

  if (!bookingId) {
    throw new Error("Agendamento não informado.")
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Selecione uma nota entre 1 e 5 estrelas.")
  }

  const booking = await db.booking.findFirst({
    where: {
      id: bookingId,
      userId,
    },
    include: {
      service: {
        select: {
          barbershopId: true,
        },
      },
    },
  })

  if (!booking) {
    throw new Error("Agendamento não encontrado.")
  }

  if (booking.status !== "CONFIRMED") {
    throw new Error("Não é possível avaliar um agendamento cancelado.")
  }

  if (booking.date.getTime() > Date.now()) {
    throw new Error("Você poderá avaliar após o horário do agendamento.")
  }

  const cleanComment = comment.trim().slice(0, 500)

  await db.rating.create({
    data: {
      rating,
      comment: cleanComment || null,
      userId,
      barbershopId: booking.service.barbershopId,
    },
  })

  revalidatePath("/bookings")
  revalidatePath(`/barbershops/${booking.service.barbershopId}`)
  revalidatePath("/")

  return { success: true }
}
