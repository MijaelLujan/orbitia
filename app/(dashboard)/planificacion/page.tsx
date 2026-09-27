// Panel principal: overview de un solo vistazo. Server component — trae los datos
// directo por fetch a la propia API en vez de pasar por services/ (esa capa es para
// componentes de cliente que necesitan re-fetch/mutación interactiva).
async function getDashboardData() {
  const [meetingsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/meetings`, { cache: "no-store" }),
  ]);
  const { data: meetings } = await meetingsRes.json();
  return { meetings };
}

export default async function DashboardPage() {
  const { meetings } = await getDashboardData();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tu semana</h1>
        <a href="/reuniones" className="text-sm rounded bg-neutral-100 text-neutral-900 px-3 py-1.5">
          + Agendar reunión
        </a>
      </div>

      <section>
        <h2 className="text-sm text-neutral-400 mb-2">Próximos eventos</h2>
        <ul className="divide-y divide-neutral-800 border border-neutral-800 rounded-md">
          {meetings.map((meeting: { id: string; title: string; startsAt: string }) => (
            <li key={meeting.id} className="p-3 text-sm flex justify-between">
              <span>{meeting.title}</span>
              <span className="text-neutral-500">{meeting.startsAt}</span>
            </li>
          ))}
          {meetings.length === 0 && (
            <li className="p-3 text-sm text-neutral-500">No tenés reuniones agendadas todavía.</li>
          )}
        </ul>
      </section>

      {/* TODO: resumen de conexiones (ver /disponibilidad y /perfil) y notificaciones recientes */}
    </div>
  );
}
