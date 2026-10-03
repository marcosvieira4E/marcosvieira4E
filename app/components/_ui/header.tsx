import Image from "next/image"
import { Card, CardContent } from "./card"
import SidebarSheet from "./sidebar-sheet"

const Header = () => {
  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-5">
        <Image alt="FSW Barber" src="/logo.png" height={18} width={120} />

        <SidebarSheet />
      </CardContent>
    </Card>
  )
}

export default Header
