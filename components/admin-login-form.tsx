"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, Glasses } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message ?? "No pudimos iniciar sesión.");
      const requestedReturn = new URLSearchParams(window.location.search).get("returnTo") ?? "/admin";
      const returnTo = requestedReturn.startsWith("/") && !requestedReturn.startsWith("//") ? requestedReturn : "/admin";
      router.replace(returnTo);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No pudimos iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return <form className="mt-7 space-y-4" onSubmit={(event) => void submit(event)}>
    <label className="block text-sm font-medium">Correo de administrador<Input className="mt-1.5" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@opticaosuna.co" /></label>
    <label className="block text-sm font-medium">Contraseña<span className="relative mt-1.5 block"><Input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tu contraseña" /><Eye size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" /></span></label>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700">{error}</p>}
    <Button className="w-full" type="submit" disabled={loading}>{loading ? "Verificando..." : "Entrar al backoffice"} <ArrowRight size={15} /></Button>
  </form>;
}
