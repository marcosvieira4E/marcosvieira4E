"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

import { Button } from "@/app/components/_ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/_ui/dialog"

const LoginRequiredDialog = () => {
  const [open, setOpen] = useState(true)

  const handleLogin = async () => {
    await signIn("google", {
      callbackUrl: "/bookings",
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Faça login para ver seus agendamentos</DialogTitle>
            <DialogDescription>
              Entre com sua conta do Google para acessar esta página.
            </DialogDescription>
          </DialogHeader>

          <Button
            type="button"
            onClick={handleLogin}
            className="w-full bg-violet-600 text-white hover:bg-violet-700"
          >
            Entrar com Google
          </Button>
        </DialogContent>
      </Dialog>

      {!open && (
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-violet-600 text-white hover:bg-violet-700"
        >
          Fazer login
        </Button>
      )}
    </>
  )
}

export default LoginRequiredDialog
