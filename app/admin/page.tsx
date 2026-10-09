import Link from "next/link";
import { ArrowUpRight, ClipboardList, Glasses, Package, Users } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";

const summaries = [
  { label: "Usuarios registrados", value: "22", note: "+12% este mes", icon: Users, href: "/admin/users", color: "text-forest bg-[#edf2eb]" },
  { label: "Referencias activas", value: "36", note: "4 con stock bajo", icon: Package, href: "/admin/inventory", color: "text-blue-700 bg-blue-50" },
  { label: "Diseños por revisar", value: "2", note: "Propuestas de creators", icon: ClipboardList, href: "/admin/designs", color: "text-violet-700 bg-violet-50" },
  { label: "Órdenes en laboratorio", value: "8", note: "3 listas para despacho", icon: Glasses, href: "/admin/lab", color: "text-amber-700 bg-amber-50" },
];

export default function AdminDashboard() {
  return <AdminShell title="Resumen" subtitle="Una mirada rápida a la operación de Lumiere_Optique.">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{summaries.map(({ label, value, note, icon: Icon, href, color }) => <Link href={href} key={label}><Card className="p-5 transition hover:-translate-y-0.5 hover:shadow-soft"><div className="flex items-center justify-between"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon size={19} /></span><ArrowUpRight className="text-muted" size={16} /></div><p className="mt-5 text-sm text-muted">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted">{note}</p></Card></Link>)}</div>
    <div className="mt-7 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
      <Card className="p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Actividad reciente</h2><p className="mt-1 text-xs text-muted">Movimientos de tu tienda</p></div><span className="rounded-full bg-[#edf2eb] px-2.5 py-1 text-[10px] font-semibold text-forest">HOY</span></div><div className="mt-5 divide-y divide-line">{[{ title: "Nueva receta enviada", detail: "Orden #OS-2408 · Lab óptico", time: "Hace 12 min", icon: Glasses }, { title: "Nuevo usuario registrado", detail: "Daniela Ruiz · Cliente", time: "Hace 38 min", icon: Users }, { title: "Diseño recibido para revisión", detail: "Montura orgánica · Creator", time: "Hace 1 h", icon: ClipboardList }].map(({ title, detail, time, icon: Icon }) => <div key={title} className="flex items-center gap-3 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-canvas text-muted"><Icon size={16} /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs text-muted">{detail}</span></span><span className="whitespace-nowrap text-[10px] text-muted">{time}</span></div>)}</div></Card>
      <Card className="bg-[#eaf0e5] p-5 sm:p-6"><p className="eyebrow text-forest">El siguiente paso</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Todo empieza con una buena mirada.</h2><p className="mt-2 text-sm leading-6 text-muted">Mantén inventario y fórmulas al día para que cada persona encuentre sus gafas ideales.</p><Link href="/admin/lab" className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-xs font-semibold text-white">Ir al laboratorio <ArrowUpRight size={14} /></Link></Card>
    </div>
  </AdminShell>;
}
