"use client";

import { useState } from "react";
import { Check, Glasses, Printer, Search } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LabOrder = { id: string; client: string; frame: string; status: string; sphere: string; cylinder: string; axis: string; add: string; dip: string };
const initialOrders: LabOrder[] = [
  { id: "OS-2408", client: "Valentina Ríos", frame: "Sierra · Verde oliva", status: "En biselado", sphere: "-2.25", cylinder: "-0.50", axis: "180°", add: "+1.00", dip: "63 mm" },
  { id: "OS-2407", client: "Santiago Mejía", frame: "Río · Negro mate", status: "Pendiente", sphere: "-1.75", cylinder: "-0.25", axis: "90°", add: "—", dip: "64 mm" },
  { id: "OS-2405", client: "Mariana López", frame: "Cielo · Vino", status: "Listo para despacho", sphere: "+1.50", cylinder: "—", axis: "—", add: "+2.00", dip: "62 mm" },
];

export default function LabPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [selected, setSelected] = useState(orders[0].id);
  const [search, setSearch] = useState("");
  const order = orders.find((item) => item.id === selected) ?? orders[0];
  const visible = orders.filter((item) => `${item.id} ${item.client} ${item.frame}`.toLowerCase().includes(search.toLowerCase()));
  function advance() {
    setOrders((current) => current.map((item) => item.id === selected ? { ...item, status: item.status === "Pendiente" ? "En biselado" : "Listo para despacho" } : item));
    toast.success("Estado de la orden actualizado");
  }
  return <AdminShell title="Laboratorio óptico" subtitle="Fórmulas claras, monturas listas y cada detalle en su lugar.">
    <div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
      <Card className="h-fit overflow-hidden"><div className="border-b border-line p-4"><h2 className="font-semibold">Órdenes de laboratorio</h2><div className="relative mt-3"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} /><Input className="pl-9" placeholder="Buscar orden..." value={search} onChange={(event) => setSearch(event.target.value)} /></div></div>{visible.map((item) => <button key={item.id} onClick={() => setSelected(item.id)} className={`w-full border-b border-line p-4 text-left transition ${selected === item.id ? "bg-[#f2f6ef]" : "hover:bg-canvas"}`}><div className="flex justify-between"><strong className="text-sm">{item.id}</strong><span className="text-[10px] text-forest">{item.status}</span></div><p className="mt-1 text-xs text-muted">{item.client} · {item.frame}</p></button>)}</Card>
      <Card className="p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-5"><div><p className="eyebrow text-forest">Orden de fabricación</p><h2 className="mt-1 text-2xl font-semibold">{order.id}</h2><p className="mt-1 text-sm text-muted">{order.client} · {order.frame}</p></div><Button variant="secondary" size="sm" onClick={() => window.print()}><Printer size={14} />Imprimir</Button></div>
        <div className="mt-6 grid grid-cols-2 gap-3">{[["Esfera", order.sphere], ["Cilindro", order.cylinder], ["Eje", order.axis], ["Adición", order.add], ["DIP", order.dip], ["Estado", order.status]].map(([label, value]) => <div key={label} className="rounded-xl bg-canvas p-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></div>)}</div>
        <div className="mt-6 rounded-xl border border-line p-4"><p className="text-sm font-semibold">Instrucciones de biselado</p><p className="mt-2 text-xs leading-5 text-muted">Centrar lentes según DIP indicada. Confirmar eje y adición con receta original antes del montaje. Verificar ajuste de patillas y limpieza final.</p></div>
        <Button className="mt-6" onClick={advance}><Check size={15} />{order.status === "Listo para despacho" ? "Marcar nuevamente en proceso" : "Avanzar estado de orden"}<Glasses size={15} /></Button>
      </Card>
    </div>
  </AdminShell>;
}
