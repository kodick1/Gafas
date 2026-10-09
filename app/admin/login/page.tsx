import Link from "next/link";
import { Glasses, ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/components/admin-login-form";
import { Card } from "@/components/ui/card";

export default function AdminLoginPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#f4f6f2] p-4">
    <div className="w-full max-w-md">
      <Link href="/" className="mb-7 block text-center font-serif text-lg tracking-[.2em]">LUMIERE_OPTIQUE</Link>
      <Card className="p-6 shadow-soft sm:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf2eb] text-forest"><Glasses size={20} /></span>
        <p className="eyebrow mt-5 text-forest">Acceso seguro</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Qué bueno verte.</h1>
        <p className="mt-2 text-sm text-muted">Inicia sesión para continuar al panel de Lumiere_Optique.</p>
        <AdminLoginForm />
      </Card>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted"><ShieldCheck size={13} /> Acceso protegido · Sesión de 8 horas</p>
    </div>
  </main>;
}
