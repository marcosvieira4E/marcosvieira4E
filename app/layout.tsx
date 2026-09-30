import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/app/components/_ui/sonner"
import Footer from "@/app/components/footer"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "FSW Barber",
  description: "Agende nos melhores barbeiros com FSW Barber",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-neutral-950">
        <div className="bg-background mx-auto w-full max-w-md md:max-w-2xl lg:max-w-6xl">
          {children}
          <Toaster />
          <Footer />
        </div>
      </body>
    </html>
  )
}
