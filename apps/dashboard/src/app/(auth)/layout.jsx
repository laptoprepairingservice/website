import Link from "next/link";

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-primary text-primary-foreground hidden flex-col justify-between p-12 lg:flex">
        <Link href="/login" className="flex items-center gap-2">
          <div className="bg-primary-foreground/10 flex size-10 items-center justify-center rounded-lg text-sm font-bold">
            RA
          </div>
          <span className="text-xl font-semibold">Ranuja Admin</span>
        </Link>
        <div>
          <h2 className="text-3xl font-semibold">Store operations, in one place</h2>
          <p className="mt-4 max-w-md opacity-80">
            Sign in with an admin account to manage catalog, orders, and customers.
          </p>
        </div>
        <p className="text-sm opacity-60">Copyright {new Date().getFullYear()} Ranuja</p>
      </div>
      <div className="flex flex-col">
        <div className="flex justify-center p-6 lg:hidden">
          <Link href="/login" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg text-sm font-bold">
              RA
            </div>
            <span className="text-lg font-semibold">Ranuja Admin</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 sm:p-12">{children}</div>
      </div>
    </div>
  );
}
