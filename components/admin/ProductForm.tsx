"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { AlertCircle, ArrowLeft, LoaderCircle, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { ImageUploaderWithCamera } from "@/components/admin/ImageUploaderWithCamera";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateProduct } from "@/hooks/use-create-product";
import { useStore } from "@/store/use-store";

const categories = ["sol", "recetada", "deportiva"] as const;
const materials = ["acetato", "titanio", "metal", "madera"] as const;

const productSchema = z.object({
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres.").max(80, "El título no puede superar 80 caracteres."),
  description: z.string().trim().min(10, "La descripción debe tener al menos 10 caracteres.").max(500, "La descripción no puede superar 500 caracteres."),
  price: z.number({ invalid_type_error: "Ingresa un precio válido." }).finite().min(0, "El precio no puede ser negativo."),
  stock: z.number({ invalid_type_error: "Ingresa un número entero." }).int("El stock debe ser un número entero.").min(0, "El stock no puede ser negativo."),
  category: z.enum(categories),
  material: z.enum(materials),
  images: z.array(z.instanceof(File, { message: "Selecciona imágenes válidas." }))
    .min(1, "Agrega al menos una imagen.")
    .max(5, "Puedes cargar hasta cinco imágenes.")
    .refine((images) => images.every((image) => image.type.startsWith("image/") && image.size <= 10 * 1024 * 1024), "Cada imagen debe ser válida y pesar hasta 10 MB.")
    .refine((images) => images.reduce((total, image) => total + image.size, 0) <= 10 * 1024 * 1024, "El tamaño total de las imágenes no puede superar 10 MB."),
});

type ProductFormValues = z.infer<typeof productSchema>;

const initialValues: Omit<ProductFormValues, "price"> = {
  title: "",
  description: "",
  stock: 0,
  category: "sol",
  material: "acetato",
  images: [],
};

export function ProductForm() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const productPreview = useStore((state) => state.productPreview);
  const setProductPreview = useStore((state) => state.setProductPreview);
  const resetProductPreview = useStore((state) => state.resetProductPreview);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const { register, control, setValue, handleSubmit, formState: { errors, isValid } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { ...initialValues, price: undefined },
    mode: "onChange",
  });
  const watched = useWatch({ control });

  useEffect(() => {
    setProductPreview({
      title: watched.title ?? "",
      description: watched.description ?? "",
      price: typeof watched.price === "number" && Number.isFinite(watched.price) ? watched.price : null,
      stock: typeof watched.stock === "number" && Number.isFinite(watched.stock) ? watched.stock : null,
      category: watched.category ?? "sol",
      material: watched.material ?? "acetato",
      images: watched.images ?? [],
    });
  }, [setProductPreview, watched.title, watched.description, watched.price, watched.stock, watched.category, watched.material, watched.images]);

  useEffect(() => () => resetProductPreview(), [resetProductPreview]);
  useEffect(() => {
    const image = productPreview.images[0];
    if (!image) {
      setPreviewImageUrl("");
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [productPreview.images]);

  const canSave = isValid && productPreview.images.length > 0 && Boolean(productPreview.title.trim());

  async function onSubmit(values: ProductFormValues) {
    const formData = new FormData();
    formData.append("title", values.title.trim());
    formData.append("description", values.description.trim());
    formData.append("price", String(values.price));
    formData.append("stock", String(values.stock));
    formData.append("category", values.category);
    formData.append("material", values.material);
    values.images.forEach((image) => formData.append("images", image));

    try {
      await createProduct.mutateAsync(formData);
      toast.success("Producto creado correctamente");
      router.push("/admin/inventory");
      router.refresh();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "No se pudo crear el producto.");
    }
  }

  const price = productPreview.price !== null ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(productPreview.price) : "$0";

  return <AdminShell title="Nuevo producto" subtitle="Agrega una montura y sus detalles al inventario.">
    <Link href="/admin/inventory" className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-ink"><ArrowLeft size={14} />Volver al inventario</Link>
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,.85fr)]">
        <section className="space-y-4">
          <div><h2 className="mb-3 text-sm font-semibold">Fotos del producto</h2><ImageUploaderWithCamera images={productPreview.images} onChange={(images) => setValue("images", images, { shouldDirty: true, shouldTouch: true, shouldValidate: true })} error={errors.images?.message} /></div>
          {createProduct.isError && <div role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700"><AlertCircle className="mt-0.5 shrink-0" size={16} /><span>{createProduct.error.message}</span></div>}
        </section>

        <div className="space-y-4">
          <Card className="space-y-5 p-5 sm:p-6">
            <div><h2 className="font-semibold">Información del producto</h2><p className="mt-1 text-xs text-muted">Los campos con * son obligatorios.</p></div>
            <label className="block text-sm font-medium">Título del modelo <span className="text-forest">*</span><Input className="mt-1.5" placeholder="Ej: Hawkers Carbon Black" maxLength={80} aria-invalid={!!errors.title} {...register("title")} />{errors.title && <span role="alert" className="mt-1 block text-xs text-red-600">{errors.title.message}</span>}</label>
            <label className="block text-sm font-medium">Descripción <span className="text-forest">*</span><textarea placeholder="Detalles del marco, estilo..." maxLength={500} aria-invalid={!!errors.description} className="mt-1.5 min-h-28 w-full resize-y rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none placeholder:text-muted/70 focus:border-forest focus:ring-2 focus:ring-forest/10" {...register("description")} />{errors.description && <span role="alert" className="mt-1 block text-xs text-red-600">{errors.description.message}</span>}<span className="mt-1 block text-right text-[10px] text-muted">{(watched.description ?? "").length}/500</span></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">Precio (COP) <span className="text-forest">*</span><span className="relative mt-1.5 block"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span><Input type="number" inputMode="numeric" min="0" step="1" className="pl-7" aria-invalid={!!errors.price} {...register("price", { valueAsNumber: true })} /></span>{errors.price && <span role="alert" className="mt-1 block text-xs text-red-600">{errors.price.message}</span>}</label>
              <label className="block text-sm font-medium">Stock inicial <span className="text-forest">*</span><Input type="number" inputMode="numeric" min="0" step="1" className="mt-1.5" aria-invalid={!!errors.stock} {...register("stock", { valueAsNumber: true })} />{errors.stock && <span role="alert" className="mt-1 block text-xs text-red-600">{errors.stock.message}</span>}</label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">Categoría<select className="mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm font-normal outline-none focus:border-forest" {...register("category")}><option value="sol">Sol</option><option value="recetada">Recetada</option><option value="deportiva">Deportiva</option></select></label>
              <label className="block text-sm font-medium">Material<select className="mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm font-normal outline-none focus:border-forest" {...register("material")}><option value="acetato">Acetato</option><option value="titanio">Titanio</option><option value="metal">Metal</option><option value="madera">Madera</option></select></label>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <p className="eyebrow text-forest">Vista previa</p>
            <div className="mt-3 flex items-center gap-3">
              {previewImageUrl
                ? <img src={previewImageUrl} alt="" className="h-16 w-16 rounded-xl border border-line object-cover" />
                : <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-canvas text-muted"><PackagePlus size={22} /></span>}
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{productPreview.title || "Nombre del modelo"}</p><p className="mt-1 line-clamp-2 text-xs text-muted">{productPreview.description || "La descripción del producto aparecerá aquí."}</p></div>
            </div>
            <div className="mt-4 flex justify-between border-t border-line pt-3 text-xs"><span className="text-muted capitalize">{productPreview.material} · {productPreview.category}</span><span className="font-semibold">{price}</span></div>
          </Card>
        </div>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/inventory")}>Cancelar</Button>
        <Button type="submit" disabled={!canSave || createProduct.isPending} className="min-w-44">
          {createProduct.isPending ? <LoaderCircle className="animate-spin" size={16} /> : <PackagePlus size={16} />}
          {createProduct.isPending ? "Guardando..." : "Guardar en Stock"}
        </Button>
      </div>
    </form>
  </AdminShell>;
}
