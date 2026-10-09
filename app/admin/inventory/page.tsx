"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ImagePlus, Package, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import type { Product } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";

const inventoryQueryKey = ["products", "inventory"] as const;

async function fetchInventoryProducts(): Promise<Product[]> {
  const response = await fetch("/api/products?admin=1");
  if (!response.ok) {
    const result = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(result?.message ?? "No se pudieron cargar los productos.");
  }
  const result = await response.json() as { products: Product[] };
  return result.products;
}

async function updateStock({ id, operation, quantity }: { id: string; operation: "increment" | "decrement"; quantity: number }) {
  const response = await fetch(`/api/products/${id}/stock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation, quantity }),
  });
  const result = await response.json() as { product?: Product; message?: string };
  if (!response.ok || !result.product) throw new Error(result.message ?? "No se pudo actualizar el stock.");
  return result.product;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("No se pudo leer la imagen."));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [adjustAmounts, setAdjustAmounts] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Product | null>(null);
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editValues, setEditValues] = useState({ title: "", description: "", price: "" });
  const productsQuery = useQuery({ queryKey: inventoryQueryKey, queryFn: fetchInventoryProducts });
  const products = productsQuery.data ?? [];
  const filtered = useMemo(() => products.filter((product) => `${product.name} ${product.id} ${product.category ?? ""} ${product.creatorName ?? ""}`.toLowerCase().includes(search.toLowerCase())), [products, search]);

  const refreshProducts = () => queryClient.invalidateQueries({ queryKey: ["products"] });
  const stockMutation = useMutation({
    mutationFn: updateStock,
    onSuccess: refreshProducts,
    onError: (error) => toast.error(error.message),
  });
  const editMutation = useMutation({
    mutationFn: async () => {
      if (!editing) throw new Error("Selecciona un producto para editar.");
      const images = editImages.length ? await Promise.all(editImages.map(fileToDataUrl)) : undefined;
      const response = await fetch(`/api/products/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editValues.title,
          description: editValues.description,
          price: Number(editValues.price),
          ...(images ? { images } : {}),
        }),
      });
      const result = await response.json() as { product?: Product; message?: string };
      if (!response.ok || !result.product) throw new Error(result.message ?? "No se pudo actualizar el producto.");
      return result.product;
    },
    onSuccess: async () => {
      setEditing(null);
      setEditImages([]);
      await refreshProducts();
      toast.success("Producto actualizado");
    },
    onError: (error) => toast.error(error.message),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json() as { message?: string };
        throw new Error(result.message ?? "No se pudo eliminar el producto.");
      }
      return id;
    },
    onSuccess: async () => {
      await refreshProducts();
      toast.success("Producto eliminado");
    },
    onError: (error) => toast.error(error.message),
  });

  function openEditor(product: Product) {
    setEditing(product);
    setEditImages([]);
    setEditValues({ title: product.name, description: product.description ?? product.subtitle, price: String(product.price) });
  }

  function onStockAdjust(product: Product, operation: "increment" | "decrement", amount: number) {
    stockMutation.mutate({ id: product.id, operation, quantity: amount });
  }

  const availableStock = products.reduce((sum, product) => sum + (product.stock ?? 0), 0);
  const inStockCount = products.filter((product) => (product.stock ?? 0) > 0).length;
  const lowStockCount = products.filter((product) => (product.stock ?? 0) <= 6).length;

  return <AdminShell title="Inventario" subtitle="Controla el stock unificado de tienda y diseños aprobados.">
    {productsQuery.isError ? <Card className="p-8"><ErrorState onRetry={() => void productsQuery.refetch()} /></Card> : <>
      <div className="mb-5 flex justify-end"><Link href="/admin/inventory/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white transition hover:bg-forest"><Plus size={15} />Nuevo producto</Link></div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3"><Card className="p-4"><p className="text-xs text-muted">Unidades disponibles</p><p className="mt-1 text-2xl font-semibold">{availableStock}</p></Card><Card className="p-4"><p className="text-xs text-muted">Productos con stock</p><p className="mt-1 text-2xl font-semibold">{inStockCount}</p></Card><Card className="p-4"><p className="text-xs text-muted">Stock bajo / agotado</p><p className="mt-1 text-2xl font-semibold text-amber-700">{lowStockCount}</p></Card></div>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-semibold">Stock por producto</h2><p className="mt-1 text-xs text-muted">Todos los productos se pueden ajustar sin importar su origen.</p></div>
          <div className="relative sm:w-64"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><Input className="pl-9" placeholder="Buscar producto..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        </div>
        {productsQuery.isPending ? <div className="p-8 text-center text-sm text-muted">Cargando inventario...</div> : <div className="overflow-x-auto">
          <table className="w-full min-w-[970px] text-left text-sm">
            <thead className="bg-[#faf9f7] text-[10px] uppercase tracking-wider text-muted"><tr>{["Foto", "Producto", "Origen", "Stock actual", "Precio", "Acciones"].map((heading) => <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">
              {filtered.map((product) => {
                const stock = product.stock ?? 0;
                return <tr key={product.id}>
                  <td className="px-4 py-3">{product.images?.[0] ? <img src={product.images[0]} alt="" className="h-12 w-12 rounded-lg bg-canvas object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-canvas text-muted"><Package size={18} /></span>}</td>
                  <td className="px-4 py-3"><strong className="block">{product.name}</strong><small className="text-xs text-muted">{product.id}</small></td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${product.source === "CREATOR_APPROVED" ? "bg-[#f5f2ed] text-forest" : "bg-canvas text-muted"}`}>{product.source === "CREATOR_APPROVED" ? `Diseño Cliente: @${product.creatorName ?? "creator"}` : "Inventario Propio"}</span></td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stock === 0 ? "bg-red-50 text-red-700" : stock <= 6 ? "bg-amber-50 text-amber-700" : "bg-[#f5f2ed] text-forest"}`}>{stock} {product.status === "out_of_stock" ? "· Agotado" : "un."}</span></td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1.5">
                    <Button aria-label={`Añadir una unidad a ${product.name}`} variant="secondary" size="icon" disabled={stockMutation.isPending} onClick={() => onStockAdjust(product, "increment", 1)}><Plus size={14} /></Button>
                    <Button aria-label={`Retirar una unidad de ${product.name}`} variant="secondary" size="icon" disabled={!stock || stockMutation.isPending} onClick={() => onStockAdjust(product, "decrement", 1)}><ArrowDown size={14} /></Button>
                    <form className="flex items-center gap-1" onSubmit={(event) => { event.preventDefault(); const amount = Number(adjustAmounts[product.id]); if (Number.isInteger(amount) && amount > 0) { onStockAdjust(product, "increment", amount); setAdjustAmounts((current) => ({ ...current, [product.id]: "" })); } else toast.error("Indica una cantidad entera mayor que cero."); }}>
                      <Input aria-label={`Cantidad para sumar a ${product.name}`} type="number" min="1" step="1" className="h-9 w-[72px]" placeholder="+5" value={adjustAmounts[product.id] ?? ""} onChange={(event) => setAdjustAmounts((current) => ({ ...current, [product.id]: event.target.value }))} />
                      <Button type="submit" variant="secondary" size="icon" aria-label={`Sumar cantidad a ${product.name}`} disabled={stockMutation.isPending}><ArrowUp size={14} /></Button>
                    </form>
                    <Button variant="secondary" size="sm" onClick={() => openEditor(product)}>Editar</Button>
                    <Button variant="secondary" size="icon" aria-label={`Eliminar ${product.name}`} disabled={deleteMutation.isPending} onClick={() => { if (window.confirm(`¿Eliminar ${product.name} del inventario?`)) deleteMutation.mutate(product.id); }}><Trash2 size={14} /></Button>
                  </div></td>
                </tr>;
              })}
            </tbody>
          </table>
          {!filtered.length && <div className="p-8 text-center text-sm text-muted"><Package className="mx-auto mb-2" />{search ? "Sin resultados para esta búsqueda." : "Aún no hay productos en el inventario."}</div>}
        </div>}
      </Card>
    </>}
    {editing && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget && !editMutation.isPending) setEditing(null); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="edit-product-title" className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-soft sm:rounded-2xl sm:p-7">
        <h2 id="edit-product-title" className="text-lg font-semibold">Editar producto</h2>
        <label className="mt-4 block text-xs font-medium">Título<Input minLength={3} maxLength={80} className="mt-1.5" value={editValues.title} onChange={(event) => setEditValues((current) => ({ ...current, title: event.target.value }))} /></label>
        <label className="mt-3 block text-xs font-medium">Descripción<textarea minLength={10} maxLength={500} className="mt-1.5 min-h-24 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" value={editValues.description} onChange={(event) => setEditValues((current) => ({ ...current, description: event.target.value }))} /></label>
        <label className="mt-3 block text-xs font-medium">Precio<Input type="number" min="0" step="1" className="mt-1.5" value={editValues.price} onChange={(event) => setEditValues((current) => ({ ...current, price: event.target.value }))} /></label>
        <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line p-3 text-xs text-muted"><ImagePlus size={16} />{editImages.length ? `${editImages.length} imagen(es) seleccionada(s)` : "Reemplazar fotos (1–5 imágenes)"}<input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => setEditImages(Array.from(event.target.files ?? []).slice(0, 5))} /></label>
        <p className="mt-2 text-[11px] text-muted">Si no seleccionas fotos, se conservarán las actuales.</p>
        <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="secondary" disabled={editMutation.isPending} onClick={() => setEditing(null)}>Cancelar</Button><Button type="button" disabled={editMutation.isPending || editValues.title.trim().length < 3 || editValues.description.trim().length < 10 || !editValues.price.trim() || !Number.isFinite(Number(editValues.price)) || Number(editValues.price) < 0 || (editImages.length > 5)} onClick={() => editMutation.mutate()}>{editMutation.isPending ? "Guardando..." : "Guardar cambios"}</Button></div>
      </section>
    </div>}
  </AdminShell>;
}
