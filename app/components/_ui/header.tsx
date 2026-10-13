import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "./card"
import SidebarSheet from "./sidebar-sheet"

const Header = () => {
  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-5">
        <Link href="/">
          <Image alt="Barber Master" src="/logo.png" height={18} width={120} />
        </Link>

        <SidebarSheet />
      </CardContent>
    </Card>
  )
}

export default Header
