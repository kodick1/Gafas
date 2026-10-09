import { NextRequest, NextResponse } from "next/server";
import { getInventoryProducts, removeInventoryProduct, updateInventoryProduct } from "@/lib/mock-products";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const maximumImagesSize = 10 * 1024 * 1024;
  const body = await request.json() as { title?: unknown; description?: unknown; price?: unknown; images?: unknown };
  if (typeof body.title !== "string" || body.title.trim().length < 3 || body.title.trim().length > 80
    || typeof body.description !== "string" || body.description.trim().length < 10 || body.description.trim().length > 500
    || typeof body.price !== "number" || !Number.isFinite(body.price) || body.price < 0
    || (body.images !== undefined && (!Array.isArray(body.images) || body.images.length < 1 || body.images.length > 5
      || !body.images.every((image) => typeof image === "string" && /^data:image\/[A-Za-z0-9.+-]+;base64,[A-Za-z0-9+/]+=*$/.test(image))
      || (body.images as string[]).reduce((size, image) => size + Math.floor(image.length * 3 / 4), 0) > maximumImagesSize))) {
    return NextResponse.json({ message: "Revisa el título, descripción, precio e imágenes del producto." }, { status: 400 });
  }
  const { id } = await params;
  if (!getInventoryProducts().some((product) => product.id === id)) {
    return NextResponse.json({ message: "No encontramos este producto." }, { status: 404 });
  }
  const product = updateInventoryProduct(id, {
    name: body.title.trim(),
    subtitle: body.description.trim(),
    description: body.description.trim(),
    price: body.price,
    ...(body.images === undefined ? {} : { images: body.images as string[] }),
  });
  if (!product) return NextResponse.json({ message: "No se pudo actualizar el producto." }, { status: 500 });
  return NextResponse.json({ product });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!removeInventoryProduct(id)) return NextResponse.json({ message: "No encontramos este producto." }, { status: 404 });
  return NextResponse.json({ success: true });
}
