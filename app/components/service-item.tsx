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

  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)

  // O callback de sessão do NextAuth precisa incluir user.id.
  const userId = session?.user
    ? (session.user as typeof session.user & { id?: string }).id
    : undefined

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
        userId,
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
          <p className="mt-1 text-sm font-bold text-purple-500">
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

          <SheetContent className="w-[min(100vw,28rem)] overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Fazer reserva</SheetTitle>
            </SheetHeader>

            <div className="border-b border-solid py-5">
              <Calendar
                mode="single"
                locale={ptBR}
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={{ before: startOfToday() }}
                className="w-full rounded-md border p-4"
              />
            </div>

            {selectedDate && (
              <section className="space-y-4 py-5">
                <p className="text-sm font-medium">
                  Horários disponíveis para {formatDate(selectedDate)}
                </p>

                <div className="flex gap-2 overflow-x-auto border-b border-solid pb-5">
                  {TIME_LIST.map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      className="shrink-0 rounded-full"
                      aria-pressed={selectedTime === time}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>

                {selectedTime && (
                  <Card>
                    <CardContent className="space-y-3 p-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold">{service.name}</h3>
                        <p className="text-sm font-bold">
                          {formatPrice(service.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Data</span>
                        <span>{formatDate(selectedDate)}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Horário</span>
                        <span>{selectedTime}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Barbearia</span>
                        <span>{barbershopName}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </section>
            )}

            {!userId && status !== "loading" && (
              <div className="space-y-2 py-3">
                <p className="text-muted-foreground text-sm">
                  Faça login para confirmar o agendamento.
                </p>

                <Button
                  type="button"
                  className="w-full"
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

            <div className="px-5 py-4">
              <Button
                type="button"
                className="w-full"
                disabled={
                  !selectedDate ||
                  !selectedTime ||
                  !userId ||
                  isBooking ||
                  status === "loading"
                }
                onClick={handleCreateBooking}
              >
                {isBooking ? "Confirmando..." : "Confirmar agendamento"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  )
}

export default ServiceItem
