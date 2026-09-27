// Layout compartido de todo lo que requiere sesión: pone el navbar/sidebar una sola vez.
// Los componentes de navegación en sí viven en components/shared/.
const NAV_ITEMS = [
  { href: "/planificacion", label: "Panel" },
  { href: "/reuniones", label: "Reuniones" },
  { href: "/disponibilidad", label: "Disponibilidad" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/perfil", label: "Perfil" },
  { href: "/notificaciones", label: "Notificaciones" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex">
      <aside className="w-56 shrink-0 border-r border-neutral-800 p-6 space-y-6">
        <div className="font-semibold">Centraliza</div>
        <nav className="flex flex-col gap-1 text-sm">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="rounded px-2 py-1.5 hover:bg-neutral-900">
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
