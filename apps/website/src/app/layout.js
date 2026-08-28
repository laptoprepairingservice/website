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
    default: `Ahmedabad`,
    template: `%s | default`,
  },
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();
  console.log(user);

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
