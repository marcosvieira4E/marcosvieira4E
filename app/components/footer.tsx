import { Card, CardContent } from "./_ui/card"

const Footer = () => {
  return (
    <footer>
      <Card className="rounded-none">
        <CardContent className="px-5 py-6 text-center">
          <p className="text-sm text-gray-400">
            © 2026 Copyright <span className="font-bold">4E WEB</span>
          </p>
        </CardContent>
      </Card>
    </footer>
  )
}

export default Footer
