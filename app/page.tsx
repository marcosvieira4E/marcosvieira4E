import Image from "next/image"
import { SearchIcon } from "lucide-react"
import Header from "./components/_ui/header"
import { Button } from "./components/_ui/button"
import { Input } from "./components/_ui/input"
import { Card, CardContent } from "./components/_ui/card"
import { Badge } from "./components/_ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "./components/_ui/avatar"

const Home = () => {
  return (
    <div>
      <Header />
      <div className="p-5">
        <h2 className="text-xl font-bold">Olá, Marcos!</h2>
        <p>Domingo, 30 de agosto.</p>
        <div className="mt-6 flex items-center gap-2">
          <Input placeholder="Faça sua busca..." />
          <Button size="icon">
            <SearchIcon />
          </Button>
        </div>
        <div className="relative mt-6 h-[150px] w-full">
          <Image
            alt="Agende nos melhores com Marcos"
            src="/banner-pizza.png"
            fill
            className="rounded-xl object-cover"
          />
        </div>

        <Card className="mt-6">
          <CardContent className="flex justify-between p-0">
            <div className="flex flex-col gap-2 py-5 pl-5">
              <Badge className="w-fit bg-purple-700 text-white hover:bg-purple-700">
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
      </div>
    </div>
  )
}

export default Home
