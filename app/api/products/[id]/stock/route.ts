import { NextRequest, NextResponse } from "next/server";
import { getInventoryProducts, updateInventoryProduct } from "@/lib/mock-products";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json() as { operation?: unknown; quantity?: unknown };
  if ((body.operation !== "increment" && body.operation !== "decrement")
    || typeof body.quantity !== "number" || !Number.isInteger(body.quantity) || body.quantity <= 0) {
    return NextResponse.json({ message: "La operación debe ser increment o decrement y la cantidad un entero positivo." }, { status: 400 });
  }
  const { id } = await params;
  const current = getInventoryProducts().find((item) => item.id === id);
  if (!current) return NextResponse.json({ message: "No encontramos este producto." }, { status: 404 });
  if (body.operation === "decrement" && current.stock !== undefined && body.quantity > current.stock) {
    return NextResponse.json({ message: "No puedes retirar más unidades que las disponibles." }, { status: 409 });
  }
  const stock = (current.stock ?? 0) + (body.operation === "increment" ? body.quantity : -body.quantity);
  const product = updateInventoryProduct(id, { stock, status: stock === 0 ? "out_of_stock" : "active" });
  if (!product) return NextResponse.json({ message: "No se pudo actualizar el stock." }, { status: 500 });
  return NextResponse.json({ product });
}
