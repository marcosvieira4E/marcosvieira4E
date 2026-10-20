import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getServerSession } from "next-auth"
import type { Prisma } from "@prisma/client"

import { authOptions } from "@/app/_lib/auth-options"
import { db } from "@/app/_lib/prisma"
import Header from "@/app/components/_ui/header"
import LoginRequiredDialog from "@/app/components/login-required-dialog"

type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    service: {
      include: {
        barbershop: true
      }
    }
  }
}>

interface BookingCardProps {
  booking: BookingWithRelations
  finalized?: boolean
}

const BookingCard = ({ booking, finalized = false }: BookingCardProps) => {
  const month = format(booking.date, "MMMM", { locale: ptBR })

  return (
    <article className="flex min-h-[112px] overflow-hidden rounded-xl border border-white/10 bg-[#191a1d]">
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-3">
        <span
          className={`w-fit rounded-full px-2 py-1 text-[10px] font-medium ${
            finalized
              ? "bg-neutral-700/70 text-gray-300"
              : "bg-violet-600/20 text-violet-300"
          }`}
        >
          {finalized ? "Finalizado" : "Confirmado"}
        </span>

        <h2 className="truncate text-sm font-semibold">
          {booking.service.name}
        </h2>

        <div className="flex min-w-0 items-center gap-2">
          <Image
            src={booking.service.barbershop.imageUrl}
            alt=""
            width={22}
            height={22}
            className="h-[22px] w-[22px] shrink-0 rounded-full object-cover"
          />

          <p className="truncate text-xs text-gray-300">
            {booking.service.barbershop.name}
          </p>
        </div>
      </div>

      <div className="flex w-[76px] shrink-0 flex-col items-center justify-center border-l border-white/10 px-2 text-center">
        <span className="text-[10px] text-gray-300 capitalize">{month}</span>
        <time
          dateTime={booking.date.toISOString()}
          className="text-2xl leading-7 font-light"
        >
          {format(booking.date, "dd")}
        </time>
        <span className="text-[10px] text-gray-300">
          {format(booking.date, "HH:mm")}
        </span>
      </div>
    </article>
  )
}

const BookingsPage = async () => {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    return (
      <main className="min-h-screen">
        <div className="relative left-1/2 w-screen -translate-x-1/2">
          <Header />
        </div>

        <section className="mx-auto w-full max-w-md space-y-4 p-5">
          <h1 className="text-lg font-semibold">Agendamentos</h1>

          <p className="text-sm text-gray-400">
            Entre na sua conta para consultar seus agendamentos.
          </p>

          <LoginRequiredDialog />

          <Link href="/" className="block text-sm text-violet-400 underline">
            Voltar ao início
          </Link>
        </section>
      </main>
    )
  }

  const bookings = await db.booking.findMany({
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

  const confirmedBookings = bookings
    .filter((booking) => booking.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const finalizedBookings = bookings
    .filter((booking) => booking.date < now)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <main className="min-h-screen">
      <div className="relative left-1/2 w-screen -translate-x-1/2">
        <Header />
      </div>

      <div className="mx-auto w-full max-w-md space-y-6 p-5">
        <h1 className="text-lg font-semibold">Agendamentos</h1>

        <section className="space-y-3">
          <h2 className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">
            Confirmados
          </h2>

          {confirmedBookings.length > 0 ? (
            <div className="flex flex-col gap-3">
              {confirmedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Você não tem agendamentos confirmados.
            </p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">
            Finalizados
          </h2>

          {finalizedBookings.length > 0 ? (
            <div className="flex flex-col gap-3">
              {finalizedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} finalized />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Você ainda não tem agendamentos finalizados.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}

export default BookingsPage
