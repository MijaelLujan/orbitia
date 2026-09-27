import { prisma } from "@/shared/prisma";
import { toMeetingDTO } from "./service";
import type { MeetingDTO } from "@/types/meeting";

export async function getAllMeetingsService(): Promise<MeetingDTO[]> {
  const meetings = await prisma.meeting.findMany({
    where: { deletedAt: null },
    orderBy: { startsAt: "asc" },
  });

  return meetings.map((meeting) =>
    toMeetingDTO({
      id: meeting.id,
      title: meeting.title,
      starts_at: meeting.startsAt,
      ends_at: meeting.endsAt,
      participants: meeting.participants,
      meeting_url: meeting.meetingUrl,
      notes: meeting.notes,
    }),
  );
}
