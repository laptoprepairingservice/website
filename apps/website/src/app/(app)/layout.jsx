import { Footer } from "./_components/footer";
import { Header } from "./_components/header";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
