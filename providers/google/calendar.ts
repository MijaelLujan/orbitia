// Funciones puntuales contra la Calendar API. Siempre reciben el accessToken ya
// descifrado y devuelven DTOs internos vía mapper.ts, nunca la forma cruda de Google.
import { toEventDTO } from "./mapper";
import type { EventDTO } from "@/types/event";

export async function listEvents(accessToken: string): Promise<EventDTO[]> {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  const data = await response.json();
  return (data.items ?? []).map(toEventDTO);
}

export async function createEvent(accessToken: string, payload: unknown): Promise<EventDTO> {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const data = await response.json();
  return toEventDTO(data);
}
