export type UserRole = "Cliente" | "Admin" | "Técnico";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "Activo" | "Invitado";
  createdAt: string;
};

const initialUsers: User[] = [
  { id: "usr-001", name: "Valentina Ríos", email: "valentina.rios@email.com", role: "Cliente", status: "Activo", createdAt: "2025-02-12" },
  { id: "usr-002", name: "Santiago Mejía", email: "s.mejia@email.com", role: "Cliente", status: "Activo", createdAt: "2025-02-11" },
  { id: "usr-003", name: "Camila Restrepo", email: "camila.r@email.com", role: "Admin", status: "Activo", createdAt: "2025-02-10" },
  { id: "usr-004", name: "Andrés Vargas", email: "andres.vargas@email.com", role: "Cliente", status: "Invitado", createdAt: "2025-02-09" },
  { id: "usr-005", name: "Mariana López", email: "mariana.lopez@email.com", role: "Técnico", status: "Activo", createdAt: "2025-02-08" },
  { id: "usr-006", name: "Nicolás Gómez", email: "nico.gomez@email.com", role: "Cliente", status: "Activo", createdAt: "2025-02-07" },
  { id: "usr-007", name: "Isabella Torres", email: "isa.torres@email.com", role: "Cliente", status: "Activo", createdAt: "2025-02-06" },
  { id: "usr-008", name: "Juan Pablo Gil", email: "jpgil@email.com", role: "Cliente", status: "Invitado", createdAt: "2025-02-05" },
  { id: "usr-009", name: "Lucía Salazar", email: "lucia.salazar@email.com", role: "Cliente", status: "Activo", createdAt: "2025-02-04" },
  { id: "usr-010", name: "Tomás Cardona", email: "tomas.cardona@email.com", role: "Técnico", status: "Activo", createdAt: "2025-02-03" },
  { id: "usr-011", name: "Daniela Ruiz", email: "daniela.ruiz@email.com", role: "Cliente", status: "Activo", createdAt: "2025-02-02" },
  { id: "usr-012", name: "Felipe Ocampo", email: "felipe.ocampo@email.com", role: "Cliente", status: "Activo", createdAt: "2025-02-01" },
  { id: "usr-013", name: "Sara Cárdenas", email: "sara.c@email.com", role: "Cliente", status: "Invitado", createdAt: "2025-01-30" },
  { id: "usr-014", name: "Mateo Arango", email: "mateo.arango@email.com", role: "Admin", status: "Activo", createdAt: "2025-01-29" },
  { id: "usr-015", name: "Manuela Pérez", email: "manuela.p@email.com", role: "Cliente", status: "Activo", createdAt: "2025-01-28" },
  { id: "usr-016", name: "Samuel Duque", email: "samuel.duque@email.com", role: "Cliente", status: "Activo", createdAt: "2025-01-27" },
  { id: "usr-017", name: "Gabriela Vélez", email: "g.velez@email.com", role: "Cliente", status: "Activo", createdAt: "2025-01-26" },
  { id: "usr-018", name: "David Castaño", email: "david.castano@email.com", role: "Cliente", status: "Invitado", createdAt: "2025-01-25" },
  { id: "usr-019", name: "Elena Marín", email: "elena.marin@email.com", role: "Cliente", status: "Activo", createdAt: "2025-01-24" },
  { id: "usr-020", name: "Martín Botero", email: "martin.botero@email.com", role: "Técnico", status: "Activo", createdAt: "2025-01-23" },
  { id: "usr-021", name: "Antonia Hoyos", email: "antonia.hoyos@email.com", role: "Cliente", status: "Activo", createdAt: "2025-01-22" },
  { id: "usr-022", name: "Esteban Jaramillo", email: "esteban.j@email.com", role: "Cliente", status: "Activo", createdAt: "2025-01-21" },
];

const storage = globalThis as typeof globalThis & { osunaUsers?: User[] };
storage.osunaUsers ??= initialUsers;

export function getUsers() {
  return storage.osunaUsers!;
}

export function setUsers(users: User[]) {
  storage.osunaUsers = users;
}
