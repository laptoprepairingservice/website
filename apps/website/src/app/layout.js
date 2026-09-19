import { Inter, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AppProvider } from "@/app/_context";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getCurrentUser } from "@/lib/user";
import { getCurrentUserCart } from "@/lib/cart";
import { getCurrentUserWishlist } from "@/lib/wishlist";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
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
  const [initialCart, initialWishlist] = await Promise.all([
    user && !user.isGuest ? getCurrentUserCart(user.id) : null,
    user && !user.isGuest ? getCurrentUserWishlist(user.id) : null,
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-outfit antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider user={user} initialCart={initialCart} initialWishlist={initialWishlist}>
            {children}
            <Toaster position="top-right" />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
