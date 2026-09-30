import Image from "next/image"
import type { BarbershopService } from "@prisma/client"
import { Card, CardContent } from "./_ui/card"
import { Button } from "./_ui/button"

interface ServiceItemProps {
  service: BarbershopService
}

const ServiceItem = ({ service }: ServiceItemProps) => {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <div className="relative h-[110px] w-[110px] shrink-0">
          <Image
            src={service.imageUrl}
            fill
            className="rounded-lg object-cover"
            alt={service.name}
          />
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <h3 className="text-sm font-semibold">{service.name}</h3>
          <p className="text-sm text-gray-400">{service.description}</p>

          <div className="mt-1 flex items-center justify-between">
            <p className="text-sm font-bold text-purple-500">
              {Number(service.price).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>

            <Button variant="secondary" size="sm">
              Reservar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ServiceItem
