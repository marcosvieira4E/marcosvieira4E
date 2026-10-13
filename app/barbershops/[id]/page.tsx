import { db } from "@/app/_lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeftIcon, MapPinIcon, StarIcon } from "lucide-react"

import { Button } from "@/app/components/_ui/button"
import SidebarSheet from "@/app/components/_ui/sidebar-sheet"
import ServiceItem from "@/app/components/service-item"
import PhoneItem from "@/app/components/phone-item"

type BarbershopPageProps = {
  params: Promise<{ id: string }>
}

const BarbershopPage = async ({ params }: BarbershopPageProps) => {
  const { id } = await params

  const barbershop = await db.barbershop.findUnique({
    where: { id },
    include: {
      ratings: true,
      services: true,
    },
  })

  if (!barbershop) {
    notFound()
  }

  const averageRating =
    barbershop.ratings.length > 0
      ? barbershop.ratings.reduce((sum, rating) => sum + rating.rating, 0) /
        barbershop.ratings.length
      : 0

  return (
    <main>
      {/* Imagem e botões de navegação */}
      <div className="relative h-[250px] w-full">
        <Image
          src={barbershop.imageUrl}
          fill
          sizes="100vw"
          className="object-cover"
          alt={barbershop.name}
          priority
        />

        <Button
          size="icon"
          variant="secondary"
          className="absolute top-4 left-4"
          nativeButton={false}
          render={<Link href="/" aria-label="Voltar para o início" />}
        >
          <ChevronLeftIcon />
        </Button>

        <div className="absolute top-4 right-4">
          <SidebarSheet />
        </div>
      </div>

      {/* Informações da barbearia */}
      <section className="border-b border-solid p-5">
        <h1 className="text-xl font-bold">{barbershop.name}</h1>

        <div className="mb-2 flex items-center gap-1">
          <MapPinIcon className="text-primary" size={18} />
          <p className="text-sm">{barbershop.address}</p>
        </div>

        <div className="flex items-center gap-1">
          <StarIcon className="fill-primary text-primary" size={18} />
          <p className="text-sm">
            {averageRating > 0
              ? `${averageRating.toLocaleString("pt-BR", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })} (${barbershop.ratings.length} avaliações)`
              : "Sem avaliações"}
          </p>
        </div>
      </section>

      {/* Descrição */}
      <section className="space-y-3 border-b border-solid p-5">
        <h2 className="text-xs font-bold text-gray-400 uppercase">Sobre Nós</h2>
        <p className="text-justify text-sm">{barbershop.description}</p>
      </section>

      {/* Serviços */}
      <section className="space-y-3 border-b border-solid p-5">
        <h2 className="text-xs font-bold text-gray-400 uppercase">Serviços</h2>

        <div className="flex flex-col gap-3">
          {barbershop.services.map((service) => (
            <ServiceItem
              key={service.id}
              barbershopName={barbershop.name}
              service={{
                id: service.id,
                name: service.name,
                description: service.description,
                imageUrl: service.imageUrl,
                barbershopId: service.barbershopId,
                price: Number(service.price),
              }}
            />
          ))}
        </div>
      </section>

      {/* Contatos */}
      <section className="space-y-3 p-5">
        <h2 className="text-xs font-bold text-gray-400 uppercase">Contato</h2>

        {barbershop.phones.map((phone, index) => (
          <PhoneItem key={`${phone}-${index}`} phone={phone} />
        ))}
      </section>
    </main>
  )
}

export default BarbershopPage
