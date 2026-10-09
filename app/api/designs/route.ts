import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { getDesigns, setDesigns } from "@/lib/mock-designs";

const allowedExtensions = [".glb", ".obj", ".svg", ".png"];

export async function GET(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ message: "Debes iniciar sesión como administrador." }, { status: 401 });
  }
  return NextResponse.json({ designs: getDesigns() });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const material = String(form.get("material") ?? "Acetato").trim();
  const color = String(form.get("color") ?? "Negro").trim();
  const lensTint = String(form.get("lensTint") ?? "Transparente").trim();
  const engravingText = String(form.get("engravingText") ?? "").trim();
  if (!["Acetato", "Titanio", "Metal", "Madera"].includes(material)
    || !["Oliva", "Negro", "Miel", "Vino"].includes(color)
    || !["Verde", "Ámbar", "Gris", "Transparente"].includes(lensTint)
    || engravingText.length > 10) {
    return NextResponse.json({ message: "Las opciones de material, color, lente o grabado no son válidas." }, { status: 400 });
  }
  const file = form.get("file");
  if (name.length < 2 || title.length < 3 || title.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || description.length < 10 || description.length > 500 || !(file instanceof File)) {
    return NextResponse.json({ message: "Completa todos los campos y adjunta un archivo válido." }, { status: 400 });
  }
  const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (!allowedExtensions.includes(extension) || file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ message: "Usa un archivo .glb, .obj, .svg o .png de máximo 20 MB." }, { status: 400 });
  }
  let image: string | undefined;
  if (extension === ".png" || extension === ".svg") {
    const mime = extension === ".svg" ? "image/svg+xml" : "image/png";
    const bytes = Buffer.from(await file.arrayBuffer()).toString("base64");
    image = `data:${mime};base64,${bytes}`;
  }
  const design = { id: `des-${crypto.randomUUID().slice(0, 8)}`, title, name, email, description, filename: file.name, image, material, color, lensTint, engravingText: engravingText.slice(0, 10), status: "Pendiente" as const, createdAt: new Date().toISOString().slice(0, 10) };
  setDesigns([design, ...getDesigns()]);
  return NextResponse.json({ design }, { status: 201 });
}
