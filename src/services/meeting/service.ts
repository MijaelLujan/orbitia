// Tipo tal como sale de Prisma (snake_case, tal como está la tabla) y la conversión a DTO
// (camelCase). Es el único archivo del módulo donde se hace esta conversión.
import type { MeetingDTO } from "@/types/meeting";

export type DbMeeting = {
  id: string;
  title: string;
  starts_at: Date;
  ends_at: Date;
  participants: string[];
  meeting_url: string;
  notes: string | null;
};

export function toMeetingDTO(meeting: DbMeeting): MeetingDTO {
  return {
    id: meeting.id,
    title: meeting.title,
    startsAt: meeting.starts_at.toISOString(),
    endsAt: meeting.ends_at.toISOString(),
    meetingUrl: meeting.meeting_url,
    participants: meeting.participants,
  };
}
