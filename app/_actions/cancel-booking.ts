"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/_lib/auth-options"
import { db } from "@/app/_lib/prisma"

const CANCELLATION_LIMIT_MS = 60 * 60 * 1000

export const cancelBooking = async (bookingId: string) => {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("Faça login para cancelar a reserva.")
  }

  if (!bookingId) {
    throw new Error("Agendamento não informado.")
  }

  const booking = await db.booking.findFirst({
    where: {
      id: bookingId,
      userId,
    },
  })

  if (!booking) {
    throw new Error("Agendamento não encontrado.")
  }

  if (booking.status === "CANCELLED") {
    throw new Error("Este agendamento já foi cancelado.")
  }

  const cancellationDeadline = booking.date.getTime() - CANCELLATION_LIMIT_MS

  if (Date.now() >= cancellationDeadline) {
    throw new Error(
      "Só é possível cancelar a reserva até 1 hora antes do horário agendado.",
    )
  }

  const result = await db.booking.updateMany({
    where: {
      id: bookingId,
      userId,
      status: "CONFIRMED",
      date: {
        gt: new Date(Date.now() + CANCELLATION_LIMIT_MS),
      },
    },
    data: {
      status: "CANCELLED",
    },
  })

  if (result.count === 0) {
    throw new Error(
      "Não foi possível cancelar. O prazo para cancelamento é até 1 hora antes do agendamento.",
    )
  }

  revalidatePath("/bookings")
  revalidatePath("/")
  revalidatePath("/barbershops/[id]", "page")

  return { success: true }
}
