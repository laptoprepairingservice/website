import { auth } from "@/lib/auth";
import { AccountShell } from "./account-shell";

export default async function AccountLayout({ children }) {
  const session = await auth();

  return <AccountShell user={session?.user}>{children}</AccountShell>;
}
