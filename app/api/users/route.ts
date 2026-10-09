import { NextRequest, NextResponse } from "next/server";
import { getUsers, setUsers, type User, type UserRole } from "@/lib/mock-users";

const roles: UserRole[] = ["Cliente", "Admin", "Técnico"];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = Math.min(10000, Math.max(1, Number(params.get("pageSize") ?? 10)));
  const search = (params.get("search") ?? "").trim().toLocaleLowerCase("es");
  const role = params.get("role") ?? "Todos";
  const filtered = getUsers().filter((user) => {
    const matchesSearch = !search || `${user.name} ${user.email}`.toLocaleLowerCase("es").includes(search);
    return matchesSearch && (role === "Todos" || user.role === role);
  });
  const start = (page - 1) * pageSize;
  return NextResponse.json({ users: filtered.slice(start, start + pageSize), total: filtered.length });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (typeof body.name !== "string" || typeof body.email !== "string" || !roles.includes(body.role)) {
    return NextResponse.json({ message: "Los datos del usuario no son válidos." }, { status: 400 });
  }
  const users = getUsers();
  if (users.some((user) => user.email.toLowerCase() === body.email.trim().toLowerCase())) {
    return NextResponse.json({ message: "Ya existe un usuario con ese correo." }, { status: 409 });
  }
  const user: User = {
    id: `usr-${crypto.randomUUID().slice(0, 8)}`,
    name: body.name.trim(),
    email: body.email.trim(),
    role: body.role,
    status: "Activo",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  setUsers([user, ...users]);
  return NextResponse.json(user, { status: 201 });
}
