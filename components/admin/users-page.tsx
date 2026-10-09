"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Download, Pencil, Plus, Search, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import type { User, UserRole } from "@/lib/mock-users";
import { useDeleteUser, useSaveUser, useUsers } from "@/hooks/use-users";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Escribe al menos 2 caracteres.").max(80, "El nombre es demasiado largo."),
  email: z.string().trim().email("Ingresa un correo válido."),
  role: z.enum(["Cliente", "Admin", "Técnico"]),
});
type FormValues = z.infer<typeof schema>;
const helper = createColumnHelper<User>();
const roleStyles: Record<UserRole, string> = {
  Cliente: "bg-blue-50 text-blue-700",
  Admin: "bg-violet-50 text-violet-700",
  Técnico: "bg-amber-50 text-amber-700",
};

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("Todos");
  const [dialogUser, setDialogUser] = useState<User | null | undefined>(undefined);
  const filters = useMemo(() => ({ page, pageSize, search, role }), [page, pageSize, search, role]);
  const query = useUsers(filters);
  const saveUser = useSaveUser();
  const deleteUser = useDeleteUser();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", role: "Cliente" } });
  const { reset } = form;
  const users = query.data?.users ?? [];
  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (dialogUser !== undefined) reset(dialogUser ? { name: dialogUser.name, email: dialogUser.email, role: dialogUser.role } : { name: "", email: "", role: "Cliente" });
  }, [dialogUser, reset]);

  useEffect(() => { setPage(1); }, [search, role, pageSize]);
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);

  const columns = useMemo(() => [
    helper.accessor("name", {
      header: "Usuario",
      cell: ({ row }) => <div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf2eb] text-xs font-semibold text-forest">{row.original.name.split(" ").slice(0, 2).map((word) => word[0]).join("")}</span><span className="min-w-0"><span className="block truncate font-semibold text-ink">{row.original.name}</span><span className="block truncate text-xs text-muted">{row.original.email}</span></span></div>,
    }),
    helper.accessor("role", { header: "Rol", cell: (info) => <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", roleStyles[info.getValue()])}>{info.getValue()}</span> }),
    helper.accessor("status", { header: "Estado", cell: (info) => <span className="flex items-center gap-2 text-xs text-muted"><span className={cn("h-1.5 w-1.5 rounded-full", info.getValue() === "Activo" ? "bg-emerald-500" : "bg-slate-300")} />{info.getValue()}</span> }),
    helper.accessor("createdAt", { header: "Fecha de registro", cell: (info) => <span className="text-xs text-muted">{new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${info.getValue()}T12:00:00`))}</span> }),
    helper.display({ id: "actions", header: "", cell: ({ row }) => <div className="flex justify-end gap-1"><Button variant="ghost" size="icon" aria-label={`Editar a ${row.original.name}`} onClick={() => setDialogUser(row.original)}><Pencil size={15} /></Button><Button variant="ghost" size="icon" aria-label={`Eliminar a ${row.original.name}`} onClick={() => handleDelete(row.original)}><Trash2 size={15} /></Button></div> }),
  ], []);

  const table = useReactTable({ data: users, columns, getCoreRowModel: getCoreRowModel(), manualPagination: true, pageCount });

  async function handleDelete(user: User) {
    if (!window.confirm(`¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteUser.mutateAsync(user.id);
      toast.success("Usuario eliminado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el usuario.");
    }
  }

  async function exportUsers(format: "csv" | "xlsx") {
    try {
      const params = new URLSearchParams({ page: "1", pageSize: "10000", search, role });
      const response = await fetch(`/api/users?${params}`);
      if (!response.ok) throw new Error("No se pudo exportar el listado.");
      const result = await response.json() as { users: User[] };
      const headers = ["Nombre", "Correo", "Rol", "Estado", "Fecha de registro"];
      const rows = result.users.map(({ name, email, role: userRole, status, createdAt }) => [name, email, userRole, status, createdAt]);
      const escapeCsv = (value: string) => {
        const safeValue = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
        return `"${safeValue.replaceAll('"', '""')}"`;
      };
      const content = format === "csv"
        ? [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n")
        : `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Usuarios"><Table>${[headers, ...rows].map((row) => `<Row>${row.map((cell) => `<Cell><Data ss:Type="String">${cell.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;")}</Data></Cell>`).join("")}</Row>`).join("")}</Table></Worksheet></Workbook>`;
      const blob = new Blob([content], { type: format === "csv" ? "text/csv;charset=utf-8" : "application/vnd.ms-excel;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = format === "csv" ? "usuarios-optica-osuna.csv" : "usuarios-optica-osuna.xls";
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success(`${result.users.length} usuarios exportados`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo exportar el listado.");
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      await saveUser.mutateAsync({ id: dialogUser?.id, data: values });
      toast.success(dialogUser ? "Usuario actualizado" : "Usuario creado");
      setDialogUser(undefined);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el usuario.");
    }
  }

  return (
    <AdminShell title="Usuarios" subtitle="Administra los perfiles, permisos y accesos de tu comunidad.">
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2eb] text-forest"><Users size={18} /></span><span><span className="block text-xs text-muted">Usuarios registrados</span><span className="mt-0.5 block text-xl font-semibold">{query.data?.total ?? "—"}</span></span></Card>
        <Card className="flex items-center gap-3 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Users size={18} /></span><span><span className="block text-xs text-muted">Clientes</span><span className="mt-0.5 block text-xl font-semibold">{query.data ? "Comunidad Lumiere" : "—"}</span></span></Card>
        <Card className="flex items-center gap-3 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Users size={18} /></span><span><span className="block text-xs text-muted">Roles con acceso</span><span className="mt-0.5 block text-xl font-semibold">3 <span className="text-xs font-normal text-muted">perfiles</span></span></span></Card>
      </div>
      <Card className="overflow-hidden shadow-soft">
        <div className="flex flex-col gap-4 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div><h2 className="font-semibold">Todos los usuarios</h2><p className="mt-1 text-xs text-muted">{total} perfiles en tu base de datos</p></div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => void exportUsers("csv")}><Download size={14} />CSV</Button>
            <Button variant="secondary" size="sm" onClick={() => void exportUsers("xlsx")}><Download size={14} />Excel</Button>
            <Button size="sm" onClick={() => setDialogUser(null)}><Plus size={15} />Nuevo usuario</Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-b border-line p-4 sm:flex-row">
          <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} /><Input aria-label="Buscar por nombre o correo" className="pl-9" placeholder="Buscar por nombre o correo..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
          <select aria-label="Filtrar por rol" className="h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-forest" value={role} onChange={(event) => setRole(event.target.value)}><option>Todos</option><option>Cliente</option><option>Admin</option><option>Técnico</option></select>
        </div>
        {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : query.isPending ? <div className="space-y-4 p-5">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div> : users.length === 0 ? <EmptyState title="No encontramos usuarios" /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#fafbf9] text-[10px] font-bold uppercase tracking-[.12em] text-muted"><tr>{table.getFlatHeaders().map((header) => <th key={header.id} className="px-5 py-3 font-semibold">{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr></thead>
              <tbody className="divide-y divide-line">{table.getRowModel().rows.map((row) => <tr key={row.id} className="transition hover:bg-[#fcfdfb]">{row.getVisibleCells().map((cell) => <td key={cell.id} className="px-5 py-3.5">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
        <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-xs text-muted">Filas por página <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-xs text-ink" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label>
          <div className="flex items-center justify-between gap-3 text-xs text-muted sm:justify-end"><span>{total ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} de ${total}` : "0 resultados"}</span><Button size="sm" variant="secondary" disabled={page <= 1 || query.isFetching} onClick={() => setPage((current) => current - 1)}>Anterior</Button><span className="text-ink">{page} / {pageCount}</span><Button size="sm" variant="secondary" disabled={page >= pageCount || query.isFetching} onClick={() => setPage((current) => current + 1)}>Siguiente</Button></div>
        </div>
      </Card>
      {dialogUser !== undefined && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialogUser(undefined); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="user-dialog-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <div className="mb-5 flex items-start justify-between"><div><h2 id="user-dialog-title" className="text-lg font-semibold">{dialogUser ? "Editar usuario" : "Nuevo usuario"}</h2><p className="mt-1 text-sm text-muted">Completa la información del perfil.</p></div><button aria-label="Cerrar" className="rounded-full p-1.5 text-muted hover:bg-canvas" onClick={() => setDialogUser(undefined)}><X size={17} /></button></div>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <label className="block text-sm font-medium">Nombre completo<Input className="mt-1.5" placeholder="Ej. Ana Martínez" {...form.register("name")} />{form.formState.errors.name && <span className="mt-1 block text-xs text-red-600">{form.formState.errors.name.message}</span>}</label>
            <label className="block text-sm font-medium">Correo electrónico<Input className="mt-1.5" type="email" placeholder="ana@email.com" {...form.register("email")} />{form.formState.errors.email && <span className="mt-1 block text-xs text-red-600">{form.formState.errors.email.message}</span>}</label>
            <label className="block text-sm font-medium">Rol<select className="mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-forest" {...form.register("role")}><option value="Cliente">Cliente</option><option value="Admin">Admin</option><option value="Técnico">Técnico</option></select></label>
            <div className="flex justify-end gap-2 border-t border-line pt-4"><Button type="button" variant="secondary" onClick={() => setDialogUser(undefined)}>Cancelar</Button><Button type="submit" disabled={saveUser.isPending}>{saveUser.isPending ? "Guardando..." : dialogUser ? "Guardar cambios" : "Crear usuario"}</Button></div>
          </form>
        </div>
      </div>}
    </AdminShell>
  );
}
