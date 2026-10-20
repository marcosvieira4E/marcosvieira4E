import Header from "@/app/components/_ui/header"

const BookingsLoading = () => {
  return (
    <main className="min-h-screen" aria-busy="true">
      <div className="relative left-1/2 w-screen -translate-x-1/2">
        <Header />
      </div>

      <div className="mx-auto w-full max-w-md space-y-6 p-5 md:max-w-2xl lg:max-w-6xl">
        <div className="h-6 w-48 animate-pulse rounded bg-white/10" />

        {[1, 2].map((section) => (
          <section key={section} className="space-y-3">
            <div className="h-4 w-40 animate-pulse rounded bg-white/10" />

            {[1, 2].map((card) => (
              <div
                key={card}
                className="h-28 animate-pulse rounded-xl border border-white/10 bg-neutral-900"
              />
            ))}
          </section>
        ))}
      </div>
    </main>
  )
}

export default BookingsLoading
