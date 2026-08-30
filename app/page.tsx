import Image from "next/image"
import { SearchIcon } from "lucide-react"
import Header from "./components/_ui/header"
import { Button } from "./components/_ui/button"
import { Input } from "./components/_ui/input"

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
      </div>
    </div>
  )
}

export default Home
