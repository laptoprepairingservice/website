import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AppProvider } from "@/app/_context";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getCurrentUser } from "@/lib/user";
import { getCurrentUserCart } from "@/lib/cart";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: `Ranuja | Coming Soon - Laptop Repair & Hardware Store`,
    template: `%s | Ranuja`,
  },
  description:
    "We are currently building something amazing. Genuine laptop repairing services, computer hardware, and spare parts in Ahmedabad.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();
  const initialCart = user && !user.isGuest ? await getCurrentUserCart(user.id) : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider user={user} initialCart={initialCart}>
            {children}
            <Toaster position="top-right" />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
