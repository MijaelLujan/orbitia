// Habla con Prisma y, para el link de videollamada, con el provider de Google.
// No sabe nada de HTTP ni de Next — eso es trabajo del controller.
import { prisma } from "@/shared/prisma";
import { toMeetingDTO } from "./service";
import type { CreateMeetingInput, MeetingDTO } from "@/types/meeting";

export async function createMeetingService(input: CreateMeetingInput): Promise<MeetingDTO> {
  // TODO: acá va la llamada a providers/google/calendar.ts (con withMeetLink de meet.ts)
  // para generar el evento real y el link de Meet antes de guardar. Se deja un placeholder
  // para no bloquear el resto del scaffold.
  const meeting = await prisma.meeting.create({
    data: {
      title: input.title,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      participants: input.participants,
      notes: input.notes,
      meetingUrl: "https://meet.google.com/pendiente-de-generar",
      userId: "TODO: id del usuario autenticado",
    },
  });

  return toMeetingDTO({
    id: meeting.id,
    title: meeting.title,
    starts_at: meeting.startsAt,
    ends_at: meeting.endsAt,
    participants: meeting.participants,
    meeting_url: meeting.meetingUrl,
    notes: meeting.notes,
  });
}
