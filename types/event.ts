// DTO de eventos que vienen de Google Calendar (ver providers/google/mapper.ts).
// No hay schema de Zod para esto porque el dato no lo manda el cliente: lo genera Google.
export type EventDTO = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  meetingUrl: string | null;
};
