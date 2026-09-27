import { prisma } from "@/shared/prisma";
import { toMeetingDTO } from "./service";
import { NotFoundError } from "@/shared/errors";
import type { MeetingDTO } from "@/types/meeting";

export async function getMeetingByIdService(id: string): Promise<MeetingDTO> {
  const meeting = await prisma.meeting.findFirst({ where: { id, deletedAt: null } });
  if (!meeting) throw new NotFoundError("Reunión");

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
