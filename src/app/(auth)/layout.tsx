export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-5 py-10 dark:bg-background">
      <div className="w-full max-w-[400px]">
        {children}
      </div>
    </div>
  )
}