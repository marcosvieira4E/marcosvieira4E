import { db } from "@/app/_lib/prisma"
import BarbershopItem from "@/app/components/barbershop-item"
import Header from "@/app/components/_ui/header"
import Search from "@/app/components/search"

interface BarbershopsPageProps {
  searchParams: Promise<{
    search?: string
  }>
}

const BarbershopsPage = async ({ searchParams }: BarbershopsPageProps) => {
  const { search } = await searchParams
  const searchTerm = search?.trim() ?? ""

  const barbershops = await db.barbershop.findMany({
    where: searchTerm
      ? {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        }
      : undefined,
    include: {
      ratings: true,
    },
  })

  return (
    <main className="p-5">
      <Header />

      <div className="my-6">
        <Search />
      </div>

      <h2 className="mt-6 mb-3 text-xs font-bold text-gray-400 uppercase">
        {searchTerm ? `Resultados para "${searchTerm}"` : "Todas as barbearias"}
      </h2>

      {barbershops.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {barbershops.map((barbershop) => (
            <BarbershopItem barbershop={barbershop} key={barbershop.id} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Nenhuma barbearia encontrada.</p>
      )}
    </main>
  )
}

export default BarbershopsPage
