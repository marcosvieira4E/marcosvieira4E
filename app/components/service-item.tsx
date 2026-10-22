"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Check } from "lucide-react"
import { toast } from "sonner"

import { createBooking } from "@/app/_actions/create-booking"
import { getBookings } from "@/app/_actions/get-bookings"
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

const ServiceItem = ({ service, barbershopName }: ServiceItemProps) => {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const handleDateSelect = (date?: Date) => {
    setSelectedDate(date)
    setSelectedTime(undefined)
    setBookedTimes([])
    setIsLoadingBookings(Boolean(date))
  }

  useEffect(() => {
    if (!selectedDate) return

    let isCurrentRequest = true

    const loadBookings = async () => {
      try {
        const bookings = await getBookings({
          serviceId: service.id,
          date: selectedDate,
        })

        if (isCurrentRequest) {
          setBookedTimes(
            bookings.map((booking) => format(new Date(booking.date), "HH:mm")),
          )
        }
      } catch {
        if (isCurrentRequest) {
          toast.error("Não foi possível carregar os horários.")
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoadingBookings(false)
        }
      }
    }

    void loadBookings()

    return () => {
      isCurrentRequest = false
    }
  }, [selectedDate, service.id])

  const availableTimes = useMemo(() => {
    if (!selectedDate) return []

    const now = new Date()

    return TIME_LIST.filter((time) => {
      if (bookedTimes.includes(time)) return false

      const [hours, minutes] = time.split(":").map(Number)
      const slotDate = new Date(selectedDate)
      slotDate.setHours(hours, minutes, 0, 0)

      if (isSameDay(selectedDate, now) && slotDate <= now) {
        return false
      }

      return true
    })
  }, [bookedTimes, selectedDate])

  const selectedDateTime = useMemo(() => {
    if (!selectedDate || !selectedTime) return undefined

    const [hours, minutes] = selectedTime.split(":").map(Number)
    const date = new Date(selectedDate)
    date.setHours(hours, minutes, 0, 0)

    return date
  }, [selectedDate, selectedTime])

  const handleConfirmBooking = async () => {
    if (status !== "authenticated" || !session?.user?.id) {
      toast.error("Faça login para confirmar o agendamento.")
      return
    }

    if (!selectedDateTime || !selectedTime) {
      toast.error("Selecione uma data e um horário.")
      return
    }

    setIsSubmitting(true)

    try {
      await createBooking({
        userId: session.user.id,
        serviceId: service.id,
        date: selectedDateTime,
      })

      setShowSuccessDialog(true)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível confirmar o agendamento."

      toast.error(message)

      if (selectedDate) {
        try {
          const bookings = await getBookings({
            serviceId: service.id,
            date: selectedDate,
          })

          setBookedTimes(
            bookings.map((booking) => format(new Date(booking.date), "HH:mm")),
          )
        } catch {
          // Mantém a mensagem do erro original.
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    await signIn("google", {
      callbackUrl: window.location.href,
    })
  }

  const handleSuccessConfirm = () => {
    setShowSuccessDialog(false)
    router.push("/")
    router.refresh()
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

          <p className="line-clamp-2 text-sm text-gray-400">
            {service.description}
          </p>

          <p className="mt-1 text-sm font-bold text-purple-500">
            {service.price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                type="button"
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

            <div className="space-y-5 px-4 pb-6">
              <Calendar
                mode="single"
                locale={ptBR}
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={{ before: new Date() }}
                className="mx-auto w-full rounded-xl border border-white/10 bg-neutral-950 p-3"
                classNames={{
                  selected:
                    "[&>button]:!bg-violet-600 [&>button]:!text-white [&>button]:!opacity-100 [&>button]:hover:!bg-violet-700",
                }}
              />

              {selectedDate && (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold">
                    Horários disponíveis para{" "}
                    {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                  </h3>

                  {isLoadingBookings ? (
                    <p className="text-muted-foreground text-sm">
                      Carregando horários...
                    </p>
                  ) : availableTimes.length > 0 ? (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {availableTimes.map((time) => {
                        const isSelected = selectedTime === time

                        return (
                          <Button
                            key={time}
                            type="button"
                            variant="outline"
                            aria-pressed={isSelected}
                            onClick={() => setSelectedTime(time)}
                            className={
                              isSelected
                                ? "!shrink-0 !rounded-full !border-violet-500 !bg-violet-600 !text-white hover:!bg-violet-700 hover:!text-white"
                                : "shrink-0 rounded-full"
                            }
                          >
                            {time}
                          </Button>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Não há horários disponíveis para esta data.
                    </p>
                  )}
                </section>
              )}

              {selectedDate && selectedTime && (
                <section className="space-y-3 rounded-xl border border-white/10 bg-neutral-900 p-4 text-sm">
                  <h3 className="font-semibold">{service.name}</h3>

                  <SummaryRow
                    label="Data"
                    value={format(selectedDate, "dd 'de' MMMM", {
                      locale: ptBR,
                    })}
                  />

                  <SummaryRow label="Horário" value={selectedTime} />
                  <SummaryRow label="Barbearia" value={barbershopName} />

                  <div className="flex justify-between gap-4 border-t border-white/10 pt-2">
                    <span>Valor</span>
                    <span className="font-semibold">
                      {service.price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                </section>
              )}

              {selectedDate &&
                selectedTime &&
                (status === "authenticated" ? (
                  <Button
                    type="button"
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting || isLoadingBookings}
                    className="w-full bg-violet-600 text-white hover:bg-violet-700"
                  >
                    {isSubmitting ? "Confirmando..." : "Confirmar agendamento"}
                  </Button>
                ) : status === "loading" ? (
                  <Button type="button" disabled className="w-full">
                    Verificando login...
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full bg-violet-600 text-white hover:bg-violet-700"
                  >
                    Entrar com Google para reservar
                  </Button>
                ))}
            </div>

            {showSuccessDialog && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-5">
                <section
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="booking-success-title"
                  className="w-full max-w-xs space-y-4 rounded-xl bg-[#191a1d] p-5 text-center shadow-2xl"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-500">
                    <Check
                      aria-hidden="true"
                      className="h-8 w-8 text-black"
                      strokeWidth={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <h2
                      id="booking-success-title"
                      className="text-base font-semibold text-white"
                    >
                      Reserva Efetuada!
                    </h2>

                    <p className="text-sm leading-relaxed text-gray-400">
                      Sua reserva foi agendada com sucesso.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={handleSuccessConfirm}
                    className="w-full bg-[#292a2e] text-white hover:bg-[#36373b]"
                  >
                    Confirmar
                  </Button>
                </section>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-muted-foreground flex justify-between gap-4">
      <span>{label}</span>
      <span className="text-foreground text-right">{value}</span>
    </div>
  )
}

export default ServiceItem
