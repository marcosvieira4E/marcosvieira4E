"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"
import {
  CalendarIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
} from "lucide-react"

import { quickSearchData } from "../_constants/quick-search"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { Button, buttonVariants } from "./button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet"

const SEARCH_ORDER = [
  "Cabelo",
  "Barba",
  "Acabamento",
  "Sobrancelha",
  "Massagem",
  "Hidratação",
]

const SidebarSheet = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const isHomeActive = pathname === "/"
  const isBookingsActive =
    pathname === "/bookings" || pathname.startsWith("/bookings/")

  const orderedSearchData = [...quickSearchData].sort((a, b) => {
    const indexA = SEARCH_ORDER.indexOf(a.title)
    const indexB = SEARCH_ORDER.indexOf(b.title)

    return (
      (indexA === -1 ? SEARCH_ORDER.length : indexA) -
      (indexB === -1 ? SEARCH_ORDER.length : indexB)
    )
  })

  const handleLogin = async () => {
    await signIn("google", {
      callbackUrl: window.location.href,
    })
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.replace("/")
    router.refresh()
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

        {session?.user ? (
          <div className="flex items-center gap-3 border-b border-white/10 py-6">
            <Avatar>
              <AvatarImage
                src={session.user.image ?? undefined}
                referrerPolicy="no-referrer"
                alt={session.user.name ?? "Foto do usuário"}
              />
              <AvatarFallback>
                {session.user.name?.trim().charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate font-bold">
                {session.user.name ?? "Usuário"}
              </p>
              <p className="truncate text-xs text-white/70">
                {session.user.email}
              </p>
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
                    Conecte-se usando sua conta do Google.
                  </DialogDescription>
                </DialogHeader>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleLogin}
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
            aria-current={isHomeActive ? "page" : undefined}
            className={buttonVariants({
              variant: "ghost",
              className: `min-h-9 justify-start gap-2 rounded-md text-sm ${
                isHomeActive
                  ? "bg-violet-500 text-white hover:bg-violet-600 hover:text-white"
                  : "text-white hover:bg-white/10 hover:text-white"
              }`,
            })}
            nativeButton={false}
            render={<Link href="/" />}
          >
            <HomeIcon size={18} />
            Início
          </SheetClose>

          <SheetClose
            aria-current={isBookingsActive ? "page" : undefined}
            className={buttonVariants({
              variant: "ghost",
              className: `min-h-9 justify-start gap-2 rounded-md text-sm ${
                isBookingsActive
                  ? "bg-violet-500 text-white hover:bg-violet-600 hover:text-white"
                  : "text-white hover:bg-white/10 hover:text-white"
              }`,
            })}
            nativeButton={false}
            render={<Link href="/bookings" />}
          >
            <CalendarIcon size={18} />
            Agendamentos
          </SheetClose>
        </div>

        <div className="flex flex-col gap-2 border-b border-white/10 py-5">
          {orderedSearchData.map((option) => (
            <SheetClose
              key={option.title}
              className={buttonVariants({
                variant: "ghost",
                className:
                  "min-h-9 justify-start gap-2 text-sm text-white hover:bg-white/10 hover:text-white",
              })}
              nativeButton={false}
              render={
                <Link
                  href={`/barbershops?service=${encodeURIComponent(option.title)}`}
                />
              }
            >
              <Image src={option.imageUrl} alt="" width={18} height={18} />
              {option.title}
            </SheetClose>
          ))}
        </div>

        {session?.user && (
          <div className="flex flex-col gap-2 py-5">
            <Button
              type="button"
              variant="ghost"
              className="min-h-9 justify-start gap-2 text-sm text-white hover:bg-white/10 hover:text-white"
              onClick={handleLogout}
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
