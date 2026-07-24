import type { Config } from "tailwindcss";

/** Class-based dark mode (`<html class="dark">`). Tokens come from `globals.css` + theme CSS. */
const config = {
  darkMode: "class" as const,
} satisfies Config;

export default config;
