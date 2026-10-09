import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createAdminSession, getAdminCredentials } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ message: "El formulario de acceso no es válido." }, { status: 400 });
  }

  const credentials = getAdminCredentials();
  if (!credentials) {
    return NextResponse.json({ message: "El acceso administrativo no está configurado en el servidor." }, { status: 503 });
  }
  if (body.email !== credentials.email || body.password !== credentials.password) {
    return NextResponse.json({ message: "Correo o contraseña incorrectos." }, { status: 401 });
  }

  const session = createAdminSession();
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
