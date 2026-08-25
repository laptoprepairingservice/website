import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

const AUTH_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
]);

function isProtectedPath(pathname) {
  return pathname.startsWith("/account") || pathname.startsWith("/admin");
}

export async function updateSession(request) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (!error) {
      user = data.user ?? null;
    }
  }

  const pathname = request.nextUrl.pathname;
  const isGuest = !user || user.is_anonymous === true || !user.email;

  if (isProtectedPath(pathname) && isGuest) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (AUTH_PATHS.has(pathname) && user && user.is_anonymous !== true && user.email) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
