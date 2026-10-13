"use client"

import Image from "next/image"
import { useState } from "react"
import { format, startOfToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { signIn, useSession } from "next-auth/react"
import { toast } from "sonner"

import { createBooking } from "../_actions/create-booking"
import { Button } from "./_ui/button"
import { Calendar } from "./_ui/calendar"
import { Card, CardContent } from "./_ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./_ui/sheet"

interface ServiceItemProps {
  barbershopName: string
  service: {
    id: string
    name: string
    description: string
    imageUrl: string
    price: number
    barbershopId: string
  }
}

const TIME_LIST = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
]

const formatPrice = (price: number) =>
  price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })

const formatDate = (date: Date) =>
  format(date, "dd 'de' MMMM", { locale: ptBR })

const ServiceItem = ({ service, barbershopName }: ServiceItemProps) => {
  const { data: session, status } = useSession()

  const userId = session?.user
    ? (session.user as typeof session.user & { id?: string }).id
    : undefined

  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime(undefined)
  }

  const handleCreateBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Escolha uma data e um horário.")
      return
    }

    if (!userId) {
      toast.error("Faça login para confirmar o agendamento.")
      return
    }

    const [hours, minutes] = selectedTime.split(":").map(Number)
    const bookingDate = new Date(selectedDate)
    bookingDate.setHours(hours, minutes, 0, 0)

    setIsBooking(true)

    try {
      await createBooking({
        serviceId: service.id,
        date: bookingDate,
      })

      toast.success("Agendamento realizado com sucesso.")
      setIsSheetOpen(false)
      setSelectedDate(undefined)
      setSelectedTime(undefined)
    } catch (error) {
      console.error("Erro ao criar agendamento:", error)

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o agendamento.",
      )
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <div className="relative h-[110px] w-[110px] shrink-0">
          <Image
            src={service.imageUrl}
            fill
            sizes="110px"
            className="rounded-lg object-cover"
            alt={service.name}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="text-sm font-semibold">{service.name}</h3>
          <p className="text-sm text-gray-400">{service.description}</p>
          <p className="mt-1 text-sm font-bold text-violet-400">
            {formatPrice(service.price)}
          </p>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger
            render={
              <Button
                variant="secondary"
                size="sm"
                aria-label={`Reservar ${service.name}`}
              />
            }
          >
            Reservar
          </SheetTrigger>

          <SheetContent className="flex w-[min(100vw,28rem)] flex-col overflow-y-auto border-l border-white/10 bg-[#141517] p-0 text-white sm:max-w-md">
            <SheetHeader className="border-b border-white/10 px-6 py-5">
              <SheetTitle className="text-left text-white">
                Fazer Reserva
              </SheetTitle>
            </SheetHeader>

            <div className="border-b border-white/10 px-4 py-5">
              <Calendar
                mode="single"
                locale={ptBR}
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={{ before: startOfToday() }}
                className="mx-auto w-full border-0 bg-transparent p-0"
                classNames={{
                  month: "w-full space-y-4",
                  month_caption:
                    "relative flex h-8 items-center justify-center px-10",
                  caption_label: "text-sm font-semibold capitalize text-white",
                  nav: "absolute inset-x-0 top-0 flex items-center justify-between",
                  button_previous:
                    "inline-flex size-8 items-center justify-center rounded-md border border-white/10 bg-transparent text-white hover:bg-white/10",
                  button_next:
                    "inline-flex size-8 items-center justify-center rounded-md border border-white/10 bg-transparent text-white hover:bg-white/10",
                  month_grid: "w-full border-collapse",
                  weekdays: "flex w-full",
                  weekday:
                    "flex-1 py-2 text-center text-xs font-normal capitalize text-gray-400",
                  week: "mt-1 flex w-full",
                  day: "flex-1 p-0 text-center",
                  day_button:
                    "mx-auto inline-flex size-9 items-center justify-center rounded-full text-sm text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 aria-selected:!border-violet-600 aria-selected:!bg-violet-600 aria-selected:!text-white data-[selected-single=true]:!border-violet-600 data-[selected-single=true]:!bg-violet-600 data-[selected-single=true]:!text-white",
                  selected:
                    "[&>button]:!border-violet-600 [&>button]:!bg-violet-600 [&>button]:!text-white",
                  today: "[&>button]:border [&>button]:border-violet-400",
                  outside: "[&>button]:text-gray-600",
                  disabled:
                    "[&>button]:cursor-not-allowed [&>button]:text-gray-700 [&>button]:opacity-50",
                }}
              />
            </div>

            {selectedDate && (
              <section className="space-y-4 border-b border-white/10 px-4 py-5">
                <p className="text-sm font-medium text-white">
                  Horários disponíveis para {formatDate(selectedDate)}
                </p>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {TIME_LIST.map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={`shrink-0 rounded-full border-white/10 ${
                        selectedTime === time
                          ? "!border-violet-600 !bg-violet-600 !text-white hover:!bg-violet-700"
                          : "bg-transparent text-white hover:bg-white/10"
                      }`}
                      aria-pressed={selectedTime === time}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </section>
            )}

            {selectedDate && selectedTime && (
              <>
                <div className="px-4 py-5">
                  <Card className="border-white/10 bg-[#1c1d20] text-white">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-bold">{service.name}</h3>
                        <p className="shrink-0 text-sm font-bold">
                          {formatPrice(service.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-gray-400">Data</span>
                        <span>{formatDate(selectedDate)}</span>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-gray-400">Horário</span>
                        <span>{selectedTime}</span>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-gray-400">Barbearia</span>
                        <span className="text-right">{barbershopName}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {status === "unauthenticated" && (
                  <div className="space-y-3 px-4 py-5">
                    <p className="text-sm text-gray-400">
                      Faça login para confirmar o agendamento.
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-white/10 bg-transparent text-white hover:bg-white/10"
                      onClick={() =>
                        signIn("google", {
                          callbackUrl: window.location.href,
                        })
                      }
                    >
                      Entrar com Google
                    </Button>
                  </div>
                )}

                {status === "authenticated" && !userId && (
                  <p className="px-4 py-5 text-sm text-red-400">
                    A sessão foi encontrada, mas não contém o ID do usuário.
                    Saia da conta e entre novamente.
                  </p>
                )}

                <div className="mt-auto border-t border-white/10 px-6 py-5">
                  <Button
                    type="button"
                    className="w-full bg-violet-600 text-white hover:bg-violet-700"
                    disabled={!userId || isBooking || status === "loading"}
                    onClick={handleCreateBooking}
                  >
                    {isBooking ? "Confirmando..." : "Confirmar"}
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  )
}

export default ServiceItem
