import Image from "next/image"
import Link from "next/link"
import { connection } from "next/server"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getServerSession } from "next-auth"

import { authOptions } from "./_lib/auth-options"
import { db } from "./_lib/prisma"
import Header from "./components/_ui/header"
import { Button } from "./components/_ui/button"
import { Card, CardContent } from "./components/_ui/card"
import { Badge } from "./components/_ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./components/_ui/avatar"
import BarbershopItem from "./components/barbershop-item"
import Search from "./components/search"

type QuickSearchOption = {
  imageUrl: string
  title: string
}

const quickSearchData: QuickSearchOption[] = [
  { imageUrl: "/cabelo.svg", title: "Cabelo" },
  { imageUrl: "/barba.svg", title: "Barba" },
  { imageUrl: "/acabamento.svg", title: "Acabamento" },
  { imageUrl: "/sobrancelha.svg", title: "Sobrancelha" },
  { imageUrl: "/hidratação.svg", title: "Hidratação" },
  { imageUrl: "/massagem.svg", title: "Massagem" },
]

const Home = async () => {
  // Renderiza com os dados da requisição atual, incluindo a sessão atualizada.
  await connection()

  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  const firstName = session?.user?.name?.trim().split(/\s+/)[0]
  const now = new Date()

  const [barbershops, popularBarbershops, nextBooking, latestPastBooking] =
    await Promise.all([
      db.barbershop.findMany({
        include: {
          ratings: true,
        },
      }),

      db.barbershop.findMany({
        include: {
          ratings: true,
        },
        orderBy: {
          ratings: {
            _count: "desc",
          },
        },
        take: 5,
      }),

      userId
        ? db.booking.findFirst({
            where: {
              userId,
              date: {
                gte: now,
              },
            },
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
        : Promise.resolve(null),

      userId
        ? db.booking.findFirst({
            where: {
              userId,
              date: {
                lt: now,
              },
            },
            include: {
              service: {
                include: {
                  barbershop: true,
                },
              },
            },
            orderBy: {
              date: "desc",
            },
          })
        : Promise.resolve(null),
    ])

  const homeBooking = nextBooking ?? latestPastBooking

  const isCancelled = homeBooking?.status === "CANCELLED"
  const isPast = homeBooking ? homeBooking.date < now : false

  const bookingStatus = isCancelled
    ? "Cancelado"
    : isPast
      ? "Finalizado"
      : "Confirmado"

  const bookingBadgeClass = isCancelled
    ? "w-fit bg-red-700 px-3 py-1 text-white hover:bg-red-700"
    : isPast
      ? "w-fit bg-neutral-700 px-3 py-1 text-gray-200 hover:bg-neutral-700"
      : "w-fit bg-purple-700 px-3 py-1 text-white hover:bg-purple-700"

  return (
    <main>
      <Header />

      <div className="p-5">
        <h1 className="text-xl font-bold">
          Olá{firstName ? `, ${firstName}` : ""}!
        </h1>

        <p className="text-sm capitalize">
          {format(now, "EEEE, d 'de' MMMM", { locale: ptBR })}.
        </p>

        <Search />

        <div className="mt-6 flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {quickSearchData.map((option) => (
            <Button
              key={option.title}
              className="shrink-0 gap-2"
              variant="secondary"
              type="button"
            >
              <Image
                src={option.imageUrl}
                width={16}
                height={16}
                alt={option.title}
              />
              {option.title}
            </Button>
          ))}
        </div>

        <div className="relative mt-6 h-[150px] w-full">
          <Image
            alt="Agende nos melhores barbeiros"
            src="/banner-pizza.png"
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="rounded-xl object-cover"
          />
        </div>

        {userId && (
          <section>
            <h2 className="mt-6 mb-3 text-xs font-bold text-gray-400 uppercase">
              Agendamento
            </h2>

            {homeBooking ? (
              <Card>
                <CardContent className="flex justify-between p-0">
                  <div className="flex min-w-0 flex-col gap-3 py-6 pl-6">
                    <Badge className={bookingBadgeClass}>{bookingStatus}</Badge>

                    <h3 className="truncate font-semibold">
                      {homeBooking.service.name}
                    </h3>

                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={homeBooking.service.barbershop.imageUrl}
                          alt={homeBooking.service.barbershop.name}
                        />
                        <AvatarFallback>
                          {homeBooking.service.barbershop.name
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <p className="truncate text-sm">
                        {homeBooking.service.barbershop.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-center justify-center border-l border-solid px-5">
                    <p className="text-sm capitalize">
                      {format(homeBooking.date, "MMMM", { locale: ptBR })}
                    </p>

                    <time
                      dateTime={homeBooking.date.toISOString()}
                      className="text-2xl"
                    >
                      {format(homeBooking.date, "dd")}
                    </time>

                    <p className="text-sm">
                      {format(homeBooking.date, "HH:mm")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="space-y-3 p-5">
                  <p className="text-sm text-gray-400">
                    Você ainda não tem agendamentos.
                  </p>

                  <Button
                    variant="secondary"
                    className="w-fit"
                    nativeButton={false}
                    render={<Link href="/barbershops" />}
                  >
                    Encontrar barbearia
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        <h2 className="mt-6 mb-3 text-xs font-bold text-gray-400 uppercase">
          Recomendados
        </h2>

        <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {barbershops.map((barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>

        <h2 className="mt-6 mb-3 text-xs font-bold text-gray-400 uppercase">
          Populares
        </h2>

        <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {popularBarbershops.map((barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>
      </div>
    </main>
  )
}

export default Home
