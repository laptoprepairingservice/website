import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AppProvider } from "@/app/_context";
import { ThemeProvider } from "@/components/providers/theme-provider";
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

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider user={user}>
            {children}
            <Toaster position="top-right" />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
