import { Federo, Lexend, Mulish } from "next/font/google";
import "./globals.css";

const mulish = Mulish({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const lexend = Lexend({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const federo = Federo({
  variable: "--font-decorative",
  subsets: ["latin"],
  weight: ["400"],
});

export const generateMetadata = async () => {
  return {
    title: "Dashboard",
    description: "Sabako jaldi hein",
  };
};

export default function Layout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="theme-soft-pop">
      <body
        className={`${mulish.variable} ${lexend.variable} ${federo.variable} font-body font-semibold antialiased`}
      >
        <>{children}</>
      </body>
    </html>
  );
}
