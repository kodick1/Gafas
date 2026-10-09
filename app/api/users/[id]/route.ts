import { NextRequest, NextResponse } from "next/server";
import { getUsers, setUsers, type UserRole } from "@/lib/mock-users";

const roles: UserRole[] = ["Cliente", "Admin", "Técnico"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  if (typeof body.name !== "string" || typeof body.email !== "string" || !roles.includes(body.role)) {
    return NextResponse.json({ message: "Los datos del usuario no son válidos." }, { status: 400 });
  }
  const { id } = await params;
  const users = getUsers();
  if (users.some((user) => user.id !== id && user.email.toLowerCase() === body.email.trim().toLowerCase())) {
    return NextResponse.json({ message: "Ya existe un usuario con ese correo." }, { status: 409 });
  }
  const index = users.findIndex((user) => user.id === id);
  if (index < 0) return NextResponse.json({ message: "No encontramos ese usuario." }, { status: 404 });
  const updated = { ...users[index], name: body.name.trim(), email: body.email.trim(), role: body.role };
  const next = [...users];
  next[index] = updated;
  setUsers(next);
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const users = getUsers();
  if (!users.some((user) => user.id === id)) {
    return NextResponse.json({ message: "No encontramos ese usuario." }, { status: 404 });
  }
  setUsers(users.filter((user) => user.id !== id));
  return NextResponse.json({ success: true });
}
