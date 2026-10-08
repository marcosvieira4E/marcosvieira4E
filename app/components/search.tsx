"use client"

import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Input } from "./_ui/input"
import { Button } from "./_ui/button"

const formSchema = z.object({
  search: z.string().trim().min(1, "Digite algo para buscar."),
})

type SearchValues = z.infer<typeof formSchema>

const Search = () => {
  const router = useRouter()

  const form = useForm<SearchValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
    },
  })

  const handleSubmit = (data: SearchValues) => {
    router.push(`/barbershops?search=${encodeURIComponent(data.search)}`)
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="mt-6 flex w-full items-start gap-2"
    >
      <div className="min-w-0 flex-1">
        <Input
          placeholder="Faça sua busca..."
          className="w-full"
          {...form.register("search")}
        />

        {form.formState.errors.search && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {form.formState.errors.search.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="icon"
        className="shrink-0"
        aria-label="Buscar"
      >
        <SearchIcon />
      </Button>
    </form>
  )
}

export default Search
