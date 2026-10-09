"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, ChevronDown, Glasses, LayoutDashboard, LogOut, Package, Settings2, Users, WandSparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const links = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/inventory", label: "Inventario", icon: Package },
  { href: "/admin/designs", label: "Diseños recibidos", icon: WandSparkles },
  { href: "/admin/lab", label: "Laboratorio óptico", icon: Glasses },
];

export function AdminShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  const pathname = usePathname();
  async function logout() {
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) throw new Error("No pudimos cerrar tu sesión.");
      window.location.assign("/admin/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No pudimos cerrar tu sesión.");
    }
  }
  return (
    <div className="min-h-screen bg-[#f7f8f6] lg:flex">
      <aside className="border-b border-line bg-white lg:fixed lg:inset-y-0 lg:flex lg:w-[250px] lg:flex-col lg:border-b-0 lg:border-r">
        <Link href="/" className="flex h-[72px] items-center gap-2 border-b border-line px-6 font-serif text-sm tracking-[.15em]">LUMIERE_OPTIQUE <span className="rounded bg-canvas px-1.5 py-1 font-sans text-[9px] font-semibold tracking-[.14em] text-muted">ADMIN</span></Link>
        <div className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:gap-1 lg:p-4">
          <p className="hidden px-3 pb-2 pt-3 text-[10px] font-bold uppercase tracking-[.14em] text-muted lg:block">Operaciones</p>
          {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition", (pathname === href || (href !== "/admin" && pathname.startsWith(href))) ? "bg-[#edf2eb] font-semibold text-forest" : "text-muted hover:bg-canvas hover:text-ink")}><Icon size={17} />{label}</Link>)}
        </div>
        <div className="mt-auto hidden border-t border-line p-4 lg:block">
          <div className="flex items-center gap-3 rounded-xl p-2"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime text-xs font-bold">LO</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">Lumiere Optique</span><span className="block text-[11px] text-muted">Administración</span></span><ChevronDown size={14} className="text-muted" /><button aria-label="Cerrar sesión" title="Cerrar sesión" onClick={() => void logout()} className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink"><LogOut size={15} /></button></div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 lg:ml-[250px]">
        <div className="flex h-[72px] items-center justify-between border-b border-line bg-white px-5 sm:px-8">
          <div className="text-xs text-muted">LUMIERE_OPTIQUE <span className="mx-2">/</span><span className="text-ink">{title}</span></div>
          <Link href="/" className="flex items-center gap-2 text-xs font-medium text-muted hover:text-ink"><Box size={15} /> Ver tienda <Settings2 className="ml-2" size={16} /></Link>
        </div>
        <div className="mx-auto max-w-[1440px] p-5 sm:p-8">
          <div className="mb-7"><p className="eyebrow text-forest">Backoffice · Lumiere_Optique</p><h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[30px]">{title}</h1><p className="mt-1 text-sm text-muted">{subtitle}</p></div>
          {children}
        </div>
      </main>
    </div>
  );
}
