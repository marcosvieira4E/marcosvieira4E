import Image from "next/image"
import Link from "next/link"
import { StarIcon } from "lucide-react"
import type { Barbershop, Rating } from "@prisma/client"
import { Card, CardContent } from "./_ui/card"
import { Button } from "./_ui/button"
import { Badge } from "./_ui/badge"

interface BarbershopItemProps {
  barbershop: Barbershop & {
    ratings: Rating[]
  }
}

const BarbershopItem = ({ barbershop }: BarbershopItemProps) => {
  const averageRating =
    barbershop.ratings.length > 0
      ? barbershop.ratings.reduce((sum, rating) => sum + rating.rating, 0) /
        barbershop.ratings.length
      : 0

  return (
    <Card className="min-w-[159px] rounded-2xl">
      <CardContent className="p-0 px-1 pt-1">
        <div className="relative h-[159px] w-[159px]">
          <Image
            alt={barbershop.name}
            fill
            className="rounded-2xl object-cover"
            src={barbershop.imageUrl}
          />

          <Badge
            className="absolute top-2 left-2 space-x-1"
            variant="secondary"
          >
            <StarIcon size={12} className="fill-purple-500 text-purple-500" />
            <span className="text-xs font-semibold">
              {averageRating > 0
                ? averageRating.toLocaleString("pt-BR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })
                : "Novo"}
            </span>
          </Badge>
        </div>

        <div className="px-1 py-3">
          <h3 className="truncate font-semibold">{barbershop.name}</h3>
          <p className="truncate text-sm text-gray-400">{barbershop.address}</p>

          <Button
            variant="secondary"
            className="mt-3 w-full"
            nativeButton={false}
            render={<Link href={"/barbershops/" + barbershop.id} />}
          >
            Reservar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default BarbershopItem
