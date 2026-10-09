import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { addInventoryProduct, getInventoryProducts, type FrameMaterial, type ProductCategory } from "@/lib/mock-products";

const categories: ProductCategory[] = ["sol", "recetada", "deportiva"];
const materials: FrameMaterial[] = ["acetato", "titanio", "metal", "madera"];
const maximumImageSize = 10 * 1024 * 1024;
const maximumImagesSize = 10 * 1024 * 1024;

export async function GET(request: NextRequest) {
  const includeUnavailable = request.nextUrl.searchParams.get("admin") === "1";
  if (includeUnavailable && !isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ message: "Debes iniciar sesión como administrador." }, { status: 401 });
  }
  const products = getInventoryProducts().filter((product) => includeUnavailable || product.status === "active");
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const price = Number(form.get("price"));
  const stock = Number(form.get("stock"));
  const category = form.get("category");
  const material = form.get("material");
  const images = form.getAll("images");

  if (title.length < 3 || title.length > 80 || description.length < 10 || description.length > 500
    || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0
    || typeof category !== "string" || !categories.includes(category as ProductCategory)
    || typeof material !== "string" || !materials.includes(material as FrameMaterial)) {
    return NextResponse.json({ message: "Revisa los datos del producto e inténtalo de nuevo." }, { status: 400 });
  }

  if (images.length < 1 || images.length > 5 || !images.every((image) => image instanceof File
    && image.type.startsWith("image/") && image.size <= maximumImageSize)) {
    return NextResponse.json({ message: "Adjunta entre 1 y 5 imágenes válidas de hasta 10 MB cada una." }, { status: 400 });
  }
  if ((images as File[]).reduce((total, image) => total + image.size, 0) > maximumImagesSize) {
    return NextResponse.json({ message: "El tamaño total de las imágenes no puede superar 10 MB." }, { status: 400 });
  }

  const imageData = await Promise.all((images as File[]).map(async (image) => {
    const bytes = Buffer.from(await image.arrayBuffer()).toString("base64");
    return `data:${image.type};base64,${bytes}`;
  }));
  const product = {
    id: `prd-${crypto.randomUUID().slice(0, 8)}`,
    name: title,
    subtitle: description,
    description,
    price,
    stock,
    category: category as ProductCategory,
    material: material === "acetato" ? "Acetato" : material === "titanio" ? "Titanio" : material === "metal" ? "Metal" : "Madera",
    color: "black",
    colorName: "Negro",
    shape: category === "deportiva" ? "Deportiva" : category === "recetada" ? "Recetada" : "Sol",
    lens: category === "recetada" ? "Progresivo" : "Polarizado",
    faceShapes: ["ovalado", "cuadrado", "redondo", "corazón"],
    prescription: category === "recetada",
    images: imageData,
    status: stock > 0 ? "active" as const : "out_of_stock" as const,
    source: "INVENTORY" as const,
    createdAt: new Date().toISOString(),
  };

  addInventoryProduct(product);
  return NextResponse.json({ product: { ...product, images: [] } }, { status: 201 });
}
