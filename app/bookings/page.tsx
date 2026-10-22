import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import type { Prisma } from "@prisma/client"

import { authOptions } from "@/app/_lib/auth-options"
import { db } from "@/app/_lib/prisma"
import Header from "@/app/components/_ui/header"
import BookingsList from "@/app/components/bookings-list"

type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    service: {
      include: {
        barbershop: true
      }
    }
  }
}>

const BookingsPage = async () => {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    redirect("/")
  }

  const bookings: BookingWithRelations[] = await db.booking.findMany({
    where: { userId },
    include: {
      service: {
        include: {
          barbershop: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  })

  const now = new Date()

  const serializedBookings = bookings.map((booking) => ({
    id: booking.id,
    date: booking.date.toISOString(),
    status: String(booking.status),
    service: {
      name: booking.service.name,
      price: Number(booking.service.price),
      barbershop: {
        name: booking.service.barbershop.name,
        imageUrl: booking.service.barbershop.imageUrl,
        address: booking.service.barbershop.address,
        phones: booking.service.barbershop.phones,
      },
    },
  }))

  const confirmedBookings = serializedBookings
    .filter(
      (booking) =>
        booking.status !== "CANCELLED" && new Date(booking.date) >= now,
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const finalizedBookings = serializedBookings
    .filter(
      (booking) =>
        booking.status === "CANCELLED" || new Date(booking.date) < now,
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <main className="min-h-screen">
      <div className="relative left-1/2 w-screen -translate-x-1/2">
        <Header />
      </div>

      <BookingsList
        currentTime={now.getTime()}
        confirmedBookings={confirmedBookings}
        finalizedBookings={finalizedBookings}
      />
    </main>
  )
}

export default BookingsPage
