import { prisma } from "@/shared/prisma";
import { toMeetingDTO } from "./service";
import type { MeetingDTO } from "@/types/meeting";

type PatchMeetingInput = Partial<{
  title: string;
  startsAt: string;
  endsAt: string;
  participants: string[];
  notes: string;
}>;

export async function patchMeetingService(id: string, input: PatchMeetingInput): Promise<MeetingDTO> {
  const meeting = await prisma.meeting.update({
    where: { id },
    data: {
      ...input,
      startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
      endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
    },
  });

  // TODO: acá se dispara la notificación MEETING_UPDATED (ver shared/audit-log.ts y
  // el modelo Notification) dentro de la misma operación.

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
