"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition, type FormEvent } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MapPinIcon, XIcon } from "lucide-react"

import { cancelBooking } from "@/app/_actions/cancel-booking"
import { createBookingRating } from "@/app/_actions/create-booking-rating"

type Booking = {
  id: string
  date: string
  status: string
  service: {
    name: string
    price: number
    barbershop: {
      name: string
      imageUrl: string
      address: string
      phones: string[]
    }
  }
}

type BookingsListProps = {
  confirmedBookings: Booking[]
  finalizedBookings: Booking[]
  currentTime: number
}

const formatDate = (date: string) =>
  format(new Date(date), "dd 'de' MMMM", { locale: ptBR })

const formatMonth = (date: string) =>
  format(new Date(date), "MMMM", { locale: ptBR })

const formatPrice = (price: number) =>
  price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })

function BookingCard({
  booking,
  onClick,
  currentTime,
}: {
  booking: Booking
  onClick: () => void
  currentTime: number
}) {
  const cancelled = booking.status === "CANCELLED"
  const past = new Date(booking.date).getTime() < currentTime
  const finalized = cancelled || past

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ver detalhes de ${booking.service.name}`}
      className="flex min-h-[112px] w-full overflow-hidden rounded-xl border border-white/10 bg-[#191a1d] text-left transition hover:border-violet-500/60 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
    >
      <span className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-4">
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
            cancelled
              ? "bg-red-500/15 text-red-400"
              : finalized
                ? "bg-neutral-700/70 text-gray-300"
                : "bg-violet-600/20 text-violet-300"
          }`}
        >
          {cancelled ? "Cancelado" : finalized ? "Finalizado" : "Confirmado"}
        </span>

        <span className="truncate text-base font-semibold">
          {booking.service.name}
        </span>

        <span className="flex min-w-0 items-center gap-2">
          <Image
            src={booking.service.barbershop.imageUrl}
            alt=""
            width={26}
            height={26}
            className="h-[26px] w-[26px] shrink-0 rounded-full object-cover"
          />
          <span className="truncate text-sm text-gray-300">
            {booking.service.barbershop.name}
          </span>
        </span>
      </span>

      <span className="flex w-[82px] shrink-0 flex-col items-center justify-center border-l border-white/10 px-2 text-center">
        <span className="text-xs text-gray-300 capitalize">
          {formatMonth(booking.date)}
        </span>
        <span className="text-2xl leading-8 font-light">
          {format(new Date(booking.date), "dd")}
        </span>
        <span className="text-xs text-gray-300">
          {format(new Date(booking.date), "HH:mm")}
        </span>
      </span>
    </button>
  )
}

export default function BookingsList({
  confirmedBookings,
  finalizedBookings,
  currentTime,
}: BookingsListProps) {
  const router = useRouter()

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isPending, startTransition] = useTransition()

  const selectedDate = selectedBooking ? new Date(selectedBooking.date) : null

  const isCancelled = selectedBooking?.status === "CANCELLED"
  const isFuture = selectedDate ? selectedDate.getTime() > currentTime : false
  const canCancel = Boolean(selectedBooking && isFuture && !isCancelled)
  const canRate = Boolean(selectedBooking && !isFuture && !isCancelled)

  const mapAddress = selectedBooking
    ? encodeURIComponent(
        `${selectedBooking.service.barbershop.name}, ${selectedBooking.service.barbershop.address}`,
      )
    : ""

  useEffect(() => {
    if (!selectedBooking || !canRate) return

    const timeoutId = window.setTimeout(() => {
      setShowRatingDialog(true)
    }, 5000)

    return () => window.clearTimeout(timeoutId)
  }, [selectedBooking, canRate])

  const openDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setCopiedPhone(null)
    setRating(0)
    setComment("")
    setShowRatingDialog(false)
    setShowCancelDialog(false)
    setError("")
    setSuccess("")
  }

  const closeDetails = () => {
    setSelectedBooking(null)
    setCopiedPhone(null)
    setRating(0)
    setComment("")
    setShowRatingDialog(false)
    setShowCancelDialog(false)
    setError("")
    setSuccess("")
  }

  const copyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone)
      setCopiedPhone(phone)
      window.setTimeout(() => setCopiedPhone(null), 1600)
    } catch {
      setError("Não foi possível copiar o telefone.")
    }
  }

  const openCancelDialog = () => {
    setError("")
    setShowCancelDialog(true)
  }

  const confirmCancel = () => {
    if (!selectedBooking) return

    setError("")
    setSuccess("")

    startTransition(async () => {
      try {
        await cancelBooking(selectedBooking.id)
        setShowCancelDialog(false)
        setSuccess("Reserva cancelada.")
        router.refresh()
        window.setTimeout(closeDetails, 900)
      } catch (actionError) {
        setShowCancelDialog(false)
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Não foi possível cancelar a reserva.",
        )
      }
    })
  }

  const handleRate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedBooking) return

    setError("")
    setSuccess("")

    startTransition(async () => {
      try {
        await createBookingRating({
          bookingId: selectedBooking.id,
          rating,
          comment,
        })

        setShowRatingDialog(false)
        setSuccess("Avaliação enviada com sucesso.")
        setRating(0)
        setComment("")
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Não foi possível enviar sua avaliação.",
        )
      }
    })
  }

  return (
    <>
      <div className="mx-auto w-full max-w-md space-y-7 p-5">
        <h1 className="text-xl font-semibold">Agendamentos</h1>

        <section className="space-y-3">
          <h2 className="text-xs font-medium tracking-wide text-gray-400 uppercase">
            Confirmados
          </h2>

          {confirmedBookings.length > 0 ? (
            <div className="flex flex-col gap-3">
              {confirmedBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  currentTime={currentTime}
                  onClick={() => openDetails(booking)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Você não tem agendamentos confirmados.
            </p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-medium tracking-wide text-gray-400 uppercase">
            Finalizados
          </h2>

          {finalizedBookings.length > 0 ? (
            <div className="flex flex-col gap-3">
              {finalizedBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  currentTime={currentTime}
                  onClick={() => openDetails(booking)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Você ainda não tem agendamentos finalizados.
            </p>
          )}
        </section>
      </div>

      {selectedBooking && selectedDate && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/65"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDetails()
          }}
          role="presentation"
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-details-title"
            className="relative flex h-full w-full max-w-md flex-col overflow-hidden border-l border-white/10 bg-[#141517] shadow-2xl"
          >
            <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/10 px-5">
              <h2
                id="booking-details-title"
                className="text-base font-semibold"
              >
                Informações da Reserva
              </h2>

              <button
                type="button"
                onClick={closeDetails}
                aria-label="Fechar detalhes"
                className="rounded-md p-2 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                <XIcon size={20} />
              </button>
            </header>

            <div className="flex-1 space-y-5 overflow-y-auto p-5 pb-6">
              <div className="relative h-36 overflow-hidden rounded-xl border border-white/10 bg-[#242528]">
                <iframe
                  title={`Mapa de ${selectedBooking.service.barbershop.name}`}
                  src={`https://maps.google.com/maps?q=${mapAddress}&output=embed`}
                  className="h-full w-full opacity-70 grayscale"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

                <div className="absolute right-2 bottom-2 left-2 flex items-center gap-3 rounded-lg bg-[#111214]/95 p-3">
                  <Image
                    src={selectedBooking.service.barbershop.imageUrl}
                    alt=""
                    width={46}
                    height={46}
                    className="h-[46px] w-[46px] rounded-full object-cover"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {selectedBooking.service.barbershop.name}
                    </p>
                    <p className="flex items-center gap-1 truncate text-xs text-gray-300">
                      <MapPinIcon size={14} className="shrink-0" />
                      {selectedBooking.service.barbershop.address}
                    </p>
                  </div>
                </div>
              </div>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  isCancelled
                    ? "bg-red-500/15 text-red-400"
                    : isFuture
                      ? "bg-violet-600/20 text-violet-300"
                      : "bg-neutral-700/70 text-gray-300"
                }`}
              >
                {isCancelled
                  ? "Cancelado"
                  : isFuture
                    ? "Confirmado"
                    : "Finalizado"}
              </span>

              <section className="space-y-4 rounded-xl border border-white/10 bg-[#191a1d] p-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base font-semibold">
                    {selectedBooking.service.name}
                  </h3>
                  <span className="shrink-0 text-sm font-medium">
                    {formatPrice(selectedBooking.service.price)}
                  </span>
                </div>

                <DetailRow
                  label="Data"
                  value={formatDate(selectedBooking.date)}
                />
                <DetailRow
                  label="Horário"
                  value={format(selectedDate, "HH:mm")}
                />
                <DetailRow
                  label="Barbearia"
                  value={selectedBooking.service.barbershop.name}
                />
              </section>

              {selectedBooking.service.barbershop.phones.length > 0 && (
                <section className="space-y-3">
                  {selectedBooking.service.barbershop.phones.map(
                    (phone, index) => (
                      <div
                        key={`${phone}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-4 py-3"
                      >
                        <span className="truncate text-sm text-gray-200">
                          {phone}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyPhone(phone)}
                          className="shrink-0 rounded-md border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
                        >
                          {copiedPhone === phone ? "Copiado" : "Copiar"}
                        </button>
                      </div>
                    ),
                  )}
                </section>
              )}

              {error && (
                <p role="alert" className="text-sm text-red-400">
                  {error}
                </p>
              )}

              {success && (
                <p role="status" className="text-sm text-green-400">
                  {success}
                </p>
              )}
            </div>

            <footer className="flex shrink-0 gap-3 border-t border-white/10 bg-[#141517] p-5">
              <button
                type="button"
                onClick={closeDetails}
                disabled={isPending}
                className="flex-1 rounded-lg bg-[#27282c] px-4 py-3 text-sm font-medium hover:bg-[#333439] disabled:opacity-50"
              >
                Voltar
              </button>

              {canCancel && (
                <button
                  type="button"
                  onClick={openCancelDialog}
                  disabled={isPending}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Cancelar Reserva
                </button>
              )}

              {canRate && (
                <button
                  type="button"
                  onClick={() => {
                    setError("")
                    setShowRatingDialog(true)
                  }}
                  className="flex-1 rounded-lg bg-violet-600 px-4 py-3 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Avaliar
                </button>
              )}
            </footer>

            {showCancelDialog && canCancel && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 p-5">
                <section
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="cancel-booking-title"
                  className="w-full max-w-sm space-y-4 rounded-xl border border-white/10 bg-[#191a1d] p-5 text-center shadow-2xl"
                >
                  <h3
                    id="cancel-booking-title"
                    className="text-base font-semibold"
                  >
                    Cancelar Reserva
                  </h3>

                  <p className="text-sm text-gray-400">
                    Tem certeza de que deseja cancelar esse agendamento?
                  </p>

                  {error && (
                    <p role="alert" className="text-sm text-red-400">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCancelDialog(false)}
                      disabled={isPending}
                      className="flex-1 rounded-lg bg-[#27282c] px-4 py-3 text-sm font-medium hover:bg-[#333439] disabled:opacity-50"
                    >
                      Voltar
                    </button>

                    <button
                      type="button"
                      onClick={confirmCancel}
                      disabled={isPending}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {isPending ? "Cancelando..." : "Confirmar"}
                    </button>
                  </div>
                </section>
              </div>
            )}

            {showRatingDialog && canRate && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 p-5">
                <form
                  onSubmit={handleRate}
                  className="w-full max-w-sm space-y-5 rounded-xl border border-white/10 bg-[#191a1d] p-6 shadow-2xl"
                >
                  <div className="text-center">
                    <h3 className="text-base font-semibold">
                      Avalie sua experiência
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-400">
                      Toque nas estrelas para avaliar sua experiência na{" "}
                      {selectedBooking.service.barbershop.name}
                    </p>
                  </div>

                  <div
                    className="flex justify-center gap-3"
                    role="radiogroup"
                    aria-label="Nota da avaliação"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={rating === value}
                        aria-label={`${value} estrela${value > 1 ? "s" : ""}`}
                        onClick={() => setRating(value)}
                        className={`text-3xl transition ${
                          value <= rating
                            ? "text-violet-400"
                            : "text-gray-600 hover:text-violet-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Deixe um comentário (opcional)"
                    maxLength={500}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-white/10 bg-[#111214] p-3 text-sm outline-none focus:border-violet-500"
                  />

                  {error && (
                    <p role="alert" className="text-sm text-red-400">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRatingDialog(false)
                        setError("")
                      }}
                      disabled={isPending}
                      className="flex-1 rounded-lg bg-[#27282c] px-4 py-3 text-sm hover:bg-[#333439] disabled:opacity-50"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={isPending || rating === 0}
                      className="flex-1 rounded-lg bg-violet-600 px-4 py-3 text-sm font-medium hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPending ? "Enviando..." : "Confirmar"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}
