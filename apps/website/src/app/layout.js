import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { STORE } from "@/lib/store-config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://Ranuja.in"),
  title: {
    default: `${STORE.name} — ${STORE.tagline} | Ahmedabad`,
    template: `%s | ${STORE.name}`,
  },
  description:
    "Premium computer hardware store in Ahmedabad, India. Genuine processors, graphics cards, motherboards, RAM, SSDs, monitors, and peripherals with fast delivery across Gujarat.",
  keywords: [
    "computer hardware Ahmedabad",
    "PC components India",
    "graphics card",
    "processor",
    "gaming PC parts",
    "Ranuja",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: STORE.name,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
