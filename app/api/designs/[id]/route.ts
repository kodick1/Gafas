import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { getDesigns, setDesigns, type DesignRequest } from "@/lib/mock-designs";
import { addInventoryProduct } from "@/lib/mock-products";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ message: "Debes iniciar sesión como administrador." }, { status: 401 });
  }
  const { status, price } = await request.json() as { status?: string; price?: number };
  if (status !== "Aprobado" && status !== "Rechazado") {
    return NextResponse.json({ message: "Estado de diseño no válido." }, { status: 400 });
  }
  const { id } = await params;
  const nextStatus: DesignRequest["status"] = status === "Aprobado" ? "Aprobado" : "Rechazado";
  const designs = getDesigns();
  const index = designs.findIndex((item) => item.id === id);
  if (index < 0) return NextResponse.json({ message: "No encontramos ese diseño." }, { status: 404 });
  const previous = designs[index];
  if (nextStatus === "Aprobado" && (!Number.isFinite(price) || price === undefined || price < 0)) {
    return NextResponse.json({ message: "Indica un precio cotizado válido antes de aprobar el diseño." }, { status: 400 });
  }
  if (previous.status === "Aprobado") {
    return NextResponse.json({ design: previous });
  }
  const updated = { ...previous, status: nextStatus, ...(nextStatus === "Aprobado" ? { price } : {}) };
  if (nextStatus === "Aprobado") {
    const color = updated.color === "Oliva" ? "olive" : updated.color === "Miel" ? "honey" : updated.color === "Vino" ? "burgundy" : "black";
    addInventoryProduct({
      id: `prd-${crypto.randomUUID().slice(0, 8)}`,
      name: updated.title,
      subtitle: updated.description,
      description: updated.description,
      price: price ?? 0,
      stock: 1,
      status: "active",
      source: "CREATOR_APPROVED",
      creatorName: updated.email.split("@")[0],
      color,
      colorName: updated.color ?? "Negro",
      material: updated.material ?? "Acetato",
      shape: "Personalizada",
      lens: updated.lensTint ?? "Polarizado",
      faceShapes: ["ovalado", "cuadrado", "redondo", "corazón"],
      prescription: false,
      images: updated.image ? [updated.image] : [],
      createdAt: new Date().toISOString(),
    });
  }
  const next = [...designs];
  next[index] = updated;
  setDesigns(next);
  return NextResponse.json({ design: updated });
}
