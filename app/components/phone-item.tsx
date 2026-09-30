"use client"

import { SmartphoneIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "./_ui/button"

interface PhoneItemProps {
  phone: string
}

const PhoneItem = ({ phone }: PhoneItemProps) => {
  const handleCopyPhoneClick = (phone: string) => {
    navigator.clipboard.writeText(phone)
    toast.success("Número copiado com sucesso!")
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SmartphoneIcon size={18} />
        <p className="text-sm">{phone}</p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleCopyPhoneClick(phone)}
      >
        Copiar
      </Button>
    </div>
  )
}

export default PhoneItem
