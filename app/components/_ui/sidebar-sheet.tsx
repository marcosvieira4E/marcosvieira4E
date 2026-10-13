"use client"

import Image from "next/image"
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import {
  CalendarIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
} from "lucide-react"
import { Button, buttonVariants } from "./button"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"
import { quickSearchData } from "../_constants/quick-search"

const SidebarSheet = () => {
  const { data } = useSession()

  const orderedSearchData = [...quickSearchData].sort((a, b) => {
    const order = [
      "Cabelo",
      "Barba",
      "Acabamento",
      "Sobrancelha",
      "Massagem",
      "Hidratação",
    ]

    return order.indexOf(a.title) - order.indexOf(b.title)
  })

  const handleLoginWithGoogleClick = () => {
    signIn("google")
  }

  const handleLogoutClick = () => {
    signOut()
  }

  return (
    <Sheet>
      <SheetTrigger
        aria-label="Abrir menu"
        className={buttonVariants({ size: "icon", variant: "outline" })}
      >
        <MenuIcon />
      </SheetTrigger>

      <SheetContent className="w-[90vw] max-w-[320px] overflow-y-auto border-l-2 border-violet-500 bg-[#141517] px-6 py-6 text-white">
        <SheetHeader className="p-0">
          <SheetTitle className="text-left text-base text-white">
            Menu
          </SheetTitle>
        </SheetHeader>

        {data?.user ? (
          <div className="flex items-center gap-3 border-b border-white/10 py-6">
            <Avatar>
              <AvatarImage
                src={data.user.image ?? undefined}
                referrerPolicy="no-referrer"
              />
              <AvatarFallback>
                {data.user.name?.charAt(0) ?? "U"}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="font-bold">{data.user.name}</p>
              <p className="text-xs text-white/70">{data.user.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between border-b border-white/10 py-6">
            <p className="text-sm font-semibold">Olá. Faça seu login!</p>

            <Dialog>
              <DialogTrigger
                aria-label="Fazer login"
                className={buttonVariants({
                  size: "icon",
                  variant: "ghost",
                  className:
                    "bg-violet-500 text-white hover:bg-violet-600 hover:text-white",
                })}
              >
                <LogInIcon size={18} />
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Faça login na plataforma</DialogTitle>
                  <DialogDescription>
                    Conecte-se usando uma conta do Google.
                  </DialogDescription>
                </DialogHeader>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleLoginWithGoogleClick}
                >
                  <Image src="/google.svg" alt="" width={18} height={18} />
                  Entrar com Google
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="flex flex-col gap-2 border-b border-white/10 py-5">
          <SheetClose
            className={buttonVariants({
              variant: "ghost",
              className:
                "min-h-9 justify-start gap-2 rounded-md bg-violet-500 text-sm text-white hover:bg-violet-600 hover:text-white",
            })}
            nativeButton={false}
            render={<Link href="/" />}
          >
            <HomeIcon size={18} />
            Início
          </SheetClose>

          <Button
            variant="ghost"
            className="min-h-9 justify-start gap-2 text-sm text-white hover:bg-white/10 hover:text-white"
          >
            <CalendarIcon size={18} />
            Agendamentos
          </Button>
        </div>

        <div className="flex flex-col gap-2 border-b border-white/10 py-5">
          {orderedSearchData.map((option) => (
            <Button
              key={option.title}
              variant="ghost"
              className="min-h-9 justify-start gap-2 text-sm text-white hover:bg-white/10 hover:text-white"
              nativeButton={false}
              render={
                <Link
                  href={`/barbershops?service=${encodeURIComponent(option.title)}`}
                />
              }
            >
              <Image src={option.imageUrl} alt="" width={18} height={18} />
              {option.title}
            </Button>
          ))}
        </div>

        {data?.user && (
          <div className="flex flex-col gap-2 py-5">
            <Button
              variant="ghost"
              className="min-h-9 justify-start gap-2 text-sm text-white hover:bg-white/10 hover:text-white"
              onClick={handleLogoutClick}
            >
              <LogOutIcon size={18} />
              Sair da conta
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default SidebarSheet
