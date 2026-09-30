import Image from "next/image"
import { SearchIcon } from "lucide-react"
import Header from "./components/_ui/header"
import { Button } from "./components/_ui/button"
import { Input } from "./components/_ui/input"
import { Card, CardContent } from "./components/_ui/card"
import { Badge } from "./components/_ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "./components/_ui/avatar"
import { db } from "./_lib/prisma"
import BarbershopItem from "./components/barbershop-item"

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
  const barbershops = await db.barbershop.findMany({
    include: {
      ratings: true,
    },
  })

  const popularBarbershops = await db.barbershop.findMany({
    include: {
      ratings: true,
    },
    orderBy: {
      ratings: {
        _count: "desc",
      },
    },
    take: 5,
  })

  return (
    <div>
      <Header />

      <div className="p-5">
        <h2 className="text-xl font-bold">Olá, Marcos!</h2>
        <p className="text-sm">Domingo, 30 de agosto.</p>

        <div className="mt-6 flex items-center gap-2">
          <Input placeholder="Faça sua busca..." />
          <Button size="icon" className="shrink-0">
            <SearchIcon />
          </Button>
        </div>

        {/* BUSCA RÁPIDA */}
        <div className="mt-6 flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {quickSearchData.map((option) => (
            <Button key={option.title} className="gap-2" variant="secondary">
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
            alt="Agende nos melhores com Marcos"
            src="/banner-pizza.png"
            fill
            className="rounded-xl object-cover"
          />
        </div>

        {/* AGENDAMENTO */}
        <h2 className="mt-6 mb-3 text-xs font-bold text-gray-400 uppercase">
          Agendamento
        </h2>

        <Card>
          <CardContent className="flex justify-between p-0">
            <div className="flex flex-col gap-3 py-6 pl-6">
              <Badge className="w-fit bg-purple-700 px-3 py-1 text-white hover:bg-purple-700">
                Confirmado
              </Badge>

              <h3 className="font-semibold">Corte de Cabelo</h3>

              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback>M</AvatarFallback>
                </Avatar>

                <p className="text-sm">Barbearia Mr Galileu</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-l-2 border-solid px-5">
              <p className="text-sm">Agosto</p>
              <p className="text-2xl">05</p>
              <p className="text-sm">20:00</p>
            </div>
          </CardContent>
        </Card>

        {/* RECOMENDADOS */}
        <h2 className="mt-6 mb-3 text-xs font-bold text-gray-400 uppercase">
          Recomendados
        </h2>

        <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {barbershops.map((barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>

        {/* POPULARES */}
        <h2 className="mt-6 mb-3 text-xs font-bold text-gray-400 uppercase">
          Populares
        </h2>

        <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {popularBarbershops.map((barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
