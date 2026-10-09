"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { User, UserRole } from "@/lib/mock-users";

export type UsersQuery = { page: number; pageSize: number; search: string; role: string };
export type UserInput = { name: string; email: string; role: UserRole };
type UserResponse = { users: User[]; total: number };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(payload?.message ?? "Ocurrió un error al comunicarse con el servidor.");
  }
  return response.json() as Promise<T>;
}

export function useUsers(filters: UsersQuery) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => request<UserResponse>(`/api/users?page=${filters.page}&pageSize=${filters.pageSize}&search=${encodeURIComponent(filters.search)}&role=${encodeURIComponent(filters.role)}`),
  });
}

export function useSaveUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: UserInput }) =>
      request<User>(id ? `/api/users/${id}` : "/api/users", { method: id ? "PATCH" : "POST", body: JSON.stringify(data) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request<{ success: true }>(`/api/users/${id}`, { method: "DELETE" }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["users"] }),
  });
}
