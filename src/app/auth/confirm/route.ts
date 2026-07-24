import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  console.log("[auth/confirm] code present:", !!code, "| length:", code?.length ?? 0);

  if (code) {
    // El redirect se crea ANTES del exchange para que setAll adjunte
    // las cookies de sesión directamente sobre esta respuesta.
    // Si se usara createClient() (next/headers) y luego NextResponse.redirect(),
    // las cookies quedarían en el cookieStore pero no en el redirect response.
    const redirectSuccess = NextResponse.redirect(new URL("/update-password", origin));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              redirectSuccess.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("[auth/confirm] exchange result:", {
      hasSession: !!data?.session,
      userId: data?.session?.user?.id ?? null,
      errorMessage: error?.message ?? null,
      errorStatus: error?.status ?? null,
    });

    if (!error) {
      console.log("[auth/confirm] redirecting to /update-password");
      return redirectSuccess;
    }
  }

  console.log("[auth/confirm] fallback: redirecting to /update-password?expired=1");
  return NextResponse.redirect(new URL("/update-password?expired=1", origin));
}
