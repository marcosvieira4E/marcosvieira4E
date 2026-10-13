import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/app/components/_ui/sonner"
import Footer from "@/app/components/footer"
import AuthProvider from "@/app/providers/auth"

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

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-neutral-950">
        <AuthProvider>
          <div className="bg-background mx-auto flex min-h-screen w-full max-w-md flex-1 flex-col md:max-w-2xl lg:max-w-6xl">
            <main className="flex-1">{children}</main>
            <Toaster />
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
