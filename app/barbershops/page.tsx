import type { Prisma } from "@prisma/client"
import { db } from "@/app/_lib/prisma"
import BarbershopItem from "@/app/components/barbershop-item"
import Header from "@/app/components/_ui/header"
import Search from "@/app/components/search"

interface BarbershopsPageProps {
  searchParams: Promise<{
    title?: string
    service?: string
    search?: string
    services?: string | string[]
  }>
}

const BarbershopsPage = async ({ searchParams }: BarbershopsPageProps) => {
  const { title, service, search, services } = await searchParams

  const searchTerm = (title ?? search ?? "").trim()

  const serviceTerms = [
    ...(service ? [service] : []),
    ...(Array.isArray(services) ? services : services ? [services] : []),
  ]
    .map((item) => item.trim())
    .filter(Boolean)

  const filters: Prisma.BarbershopWhereInput[] = []

  if (searchTerm) {
    filters.push({
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          services: {
            some: {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    })
  }

  if (serviceTerms.length > 0) {
    filters.push({
      OR: serviceTerms.map((serviceName) => ({
        services: {
          some: {
            name: {
              contains: serviceName,
              mode: "insensitive",
            },
          },
        },
      })),
    })
  }

  const barbershops = await db.barbershop.findMany({
    where: filters.length > 0 ? { AND: filters } : undefined,
    include: {
      ratings: true,
    },
  })

  const resultLabel = searchTerm || serviceTerms.join(", ")

  return (
    <main>
      <Header />

      <div className="my-6 px-5">
        <Search />
      </div>

      <div className="px-5">
        <h2 className="mt-6 mb-3 text-xs font-bold text-gray-400 uppercase">
          {resultLabel
            ? `Resultados para "${resultLabel}"`
            : "Todas as barbearias"}
        </h2>

        {barbershops.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {barbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Nenhuma barbearia encontrada.</p>
        )}
      </div>
    </main>
  )
}

export default BarbershopsPage
