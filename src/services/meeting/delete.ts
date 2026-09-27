// Soft delete: nunca se borra el registro, se marca deletedAt.
import { prisma } from "@/shared/prisma";
import { toMeetingDTO } from "./service";
import type { MeetingDTO } from "@/types/meeting";

export async function deleteMeetingService(id: string): Promise<MeetingDTO> {
  const meeting = await prisma.meeting.update({
    where: { id },
    data: { deletedAt: new Date() },
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
