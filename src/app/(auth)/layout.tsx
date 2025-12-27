export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold text-primary tracking-tight">Barriga 30</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu programa de 30 dias para transformação
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
