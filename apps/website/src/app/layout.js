import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AppProvider } from "@/app/_context";
import { getCurrentUser } from "@/lib/user";

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
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProvider user={user}>
          {children}
          <Toaster position="top-right" />
        </AppProvider>
      </body>
    </html>
  );
}
