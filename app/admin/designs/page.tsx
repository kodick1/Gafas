"use client";

import { useEffect, useState } from "react";
import { Check, Clock3, FileBox, X } from "lucide-react";
import { toast } from "sonner";
import type { DesignRequest } from "@/lib/mock-designs";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";

export default function DesignsPage() {
  const queryClient = useQueryClient();
  const [designs, setDesigns] = useState<DesignRequest[]>([]);
  const [quotes, setQuotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/designs");
      if (!response.ok) throw new Error("No se pudieron cargar los diseños.");
      const result = await response.json() as { designs: DesignRequest[] };
      setDesigns(result.designs);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudieron cargar los diseños."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function update(id: string, status: "Aprobado" | "Rechazado") {
    const quote = quotes[id];
    if (status === "Aprobado" && (!quote || !Number.isFinite(Number(quote)) || Number(quote) < 0)) {
      toast.error("Indica un precio cotizado válido antes de aprobar el diseño.");
      return;
    }
    try {
      const response = await fetch(`/api/designs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, ...(status === "Aprobado" ? { price: Number(quote) } : {}) }) });
      if (!response.ok) throw new Error("No se pudo actualizar la propuesta.");
      const result = await response.json() as { design: DesignRequest };
      setDesigns((current) => current.map((item) => item.id === id ? result.design : item));
      if (status === "Aprobado") await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-products"] }),
      ]);
      toast.success(status === "Aprobado" ? "Diseño aprobado" : "Diseño rechazado");
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : "No se pudo actualizar la propuesta."); }
  }
  const columns: DesignRequest["status"][] = ["Pendiente", "Aprobado", "Rechazado"];
  return <AdminShell title="Diseños recibidos" subtitle="Revisa las ideas de la comunidad y acompáñalas hasta la producción.">
    {error ? <Card className="p-8 text-center"><p className="text-sm text-red-700">{error}</p><Button className="mt-3" variant="secondary" size="sm" onClick={() => void load()}>Reintentar</Button></Card> : <div className="grid gap-4 lg:grid-cols-3">{columns.map((status) => <section key={status}><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">{status}</h2><span className="rounded-full bg-white px-2 py-1 text-[10px] text-muted">{designs.filter((design) => design.status === status).length}</span></div><div className="space-y-3">{loading ? <Skeleton className="h-48" /> : designs.filter((design) => design.status === status).length ? designs.filter((design) => design.status === status).map((design) => <Card key={design.id} className="p-4"><div className="flex items-start justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f2ed] text-forest"><FileBox size={17} /></span><span className="flex items-center gap-1 text-[10px] text-muted"><Clock3 size={12} />{design.createdAt}</span></div>{design.image && <img src={design.image} alt={design.title} className="mt-3 h-36 w-full rounded-xl bg-canvas object-contain" />}<h3 className="mt-4 text-sm font-semibold">{design.title}</h3><p className="mt-1 text-xs text-muted">{design.name} · {design.email}</p><p className="mt-3 text-xs leading-5 text-muted">{design.description}</p><p className="mt-2 text-[10px] text-muted">{design.material ?? "Acetato"} · {design.color ?? "Negro"} · {design.lensTint ?? "Transparente"}{design.engravingText ? ` · ${design.engravingText}` : ""}</p><p className="mt-3 truncate rounded-lg bg-canvas px-3 py-2 text-xs">📎 {design.filename}</p>{status === "Pendiente" && <><label className="mt-3 block text-xs font-medium">Precio cotizado <Input type="number" min="0" step="1" value={quotes[design.id] ?? design.price ?? ""} onChange={(event) => setQuotes((current) => ({ ...current, [design.id]: event.target.value }))} className="mt-1" /></label><div className="mt-4 flex gap-2"><Button className="flex-1" size="sm" onClick={() => void update(design.id, "Aprobado")}><Check size={14} />Aprobar</Button><Button className="flex-1" variant="secondary" size="sm" onClick={() => void update(design.id, "Rechazado")}><X size={14} />Rechazar</Button></div></>}</Card>) : status === "Pendiente" ? <Card><EmptyState title="Sin propuestas pendientes" description="Los nuevos diseños aparecerán aquí." /></Card> : null}</div></section>)}</div>}
  </AdminShell>;
}
