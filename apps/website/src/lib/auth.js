import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { createAuthClient } from "@/lib/supabase/auth-client";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function mapUser(user) {
  const metadata = user.user_metadata || {};
  const firstName = metadata.first_name || "";
  const lastName = metadata.last_name || "";

  return {
    id: user.id,
    email: user.email,
    name: [firstName, lastName].filter(Boolean).join(" ") || user.email,
    first_name: firstName,
    last_name: lastName,
    phone: metadata.phone || "",
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const supabase = createAuthClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });

        console.log(data);
        console.log(error);

        if (error || !data.user) {
          if (error?.message?.toLowerCase().includes("email not confirmed")) {
            throw new Error("EMAIL_NOT_CONFIRMED");
          }
          return null;
        }

        return mapUser(data.user);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.first_name = token.first_name;
        session.user.last_name = token.last_name;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
});
