// Único lugar donde se traduce la forma de Google Calendar al formato interno.
// Nada fuera de providers/google/ conoce esta forma cruda.
import type { EventDTO } from "@/types/event";

type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  start: { dateTime: string };
  end: { dateTime: string };
  hangoutLink?: string;
};

export function toEventDTO(event: GoogleCalendarEvent): EventDTO {
  return {
    id: event.id,
    title: event.summary ?? "(sin título)",
    startsAt: event.start.dateTime,
    endsAt: event.end.dateTime,
    meetingUrl: event.hangoutLink ?? null,
  };
}
