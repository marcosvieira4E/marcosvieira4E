import Image from "next/image"
import Link from "next/link"
import { CalendarIcon, HomeIcon, LogOutIcon, MenuIcon } from "lucide-react"
import { Card, CardContent } from "./card"
import { Button, buttonVariants } from "./button"
import { Avatar, AvatarImage, AvatarFallback } from "./avatar"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet"
import { quickSearchData } from "../_constants/quick-search"

const Header = () => {
  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-5">
        <Image alt="FSW Barber" src="/logo.png" height={18} width={120} />

        <Sheet>
          <SheetTrigger
            className={buttonVariants({ variant: "outline", size: "icon" })}
          >
            <MenuIcon />
          </SheetTrigger>

          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>

            <div className="flex items-center gap-3 border-b border-solid py-5">
              <Avatar>
                <AvatarImage src="/avatar.png" />
                <AvatarFallback>FR</AvatarFallback>
              </Avatar>

              <div>
                <p className="font-bold">Felipe Rocha</p>
                <p className="text-xs">felipe@fullstackclub.io</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-b border-solid py-5">
              <SheetClose
                className={buttonVariants({
                  variant: "ghost",
                  className: "justify-start gap-2",
                })}
                nativeButton={false}
                render={<Link href="/" />}
              >
                <HomeIcon size={18} />
                Início
              </SheetClose>

              <Button className="justify-start gap-2" variant="ghost">
                <CalendarIcon size={18} />
                Agendamentos
              </Button>
            </div>

            <div className="flex flex-col gap-2 border-b border-solid py-5">
              {quickSearchData.map((option) => (
                <Button
                  key={option.title}
                  variant="ghost"
                  className="justify-start gap-2"
                >
                  <Image
                    src={option.imageUrl}
                    alt={option.title}
                    width={18}
                    height={18}
                  />
                  {option.title}
                </Button>
              ))}
            </div>

            <div className="flex flex-col gap-2 py-5">
              <Button variant="ghost" className="justify-start gap-2">
                <LogOutIcon size={18} />
                Sair da conta
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  )
}

export default Header
