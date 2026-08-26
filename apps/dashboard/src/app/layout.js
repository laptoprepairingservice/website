import { Mulish } from "next/font/google";
import { Toaster } from "sonner";
import { AppProvider } from "@/app/_context";
import { getCurrentUser } from "@/lib/user";
import { AppThemeProvider } from "@/provider/app-theme-context";
import "./globals.css";

const mulish = Mulish({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const generateMetadata = async () => {
  return {
    title: "Ranuja Admin",
    description: "Ranuja store dashboard",
  };
};

export default async function Layout({ children }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${mulish.variable} font-sans antialiased`}>
        <AppThemeProvider>
          <AppProvider user={user}>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </AppProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
