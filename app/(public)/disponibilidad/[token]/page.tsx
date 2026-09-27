// Vista pública, sin sesión, de solo lectura. No hay ninguna acción de reservar ni
// formulario de contacto: es una vitrina, no un sistema de agendamiento por terceros.
import { notFound } from "next/navigation";

async function getPublicAvailability(token: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/availability/${token}`, {
    cache: "no-store",
  });
  if (!response.ok) return null;
  const { data } = await response.json();
  return data;
}

export default async function PublicAvailabilityPage({ params }: { params: { token: string } }) {
  const availability = await getPublicAvailability(params.token);
  if (!availability) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center py-16">
      <div className="w-full max-w-lg space-y-6 p-8">
        <div>
          <p className="text-sm text-neutral-400">Disponibilidad compartida por {availability.ownerName}</p>
          <h1 className="text-xl font-semibold mt-1">Semana del {availability.weekStart}</h1>
        </div>

        {/* TODO: renderizar availability.freeBlocks agrupados por día */}

        <p className="text-xs text-neutral-500">
          Solo lectura. Este enlace no requiere cuenta y vence automáticamente.
        </p>
      </div>
    </main>
  );
}
