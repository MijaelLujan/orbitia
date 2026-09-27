// Consumo de la propia API desde el navegador. Todo componente de cliente que necesite
// reuniones pasa por acá, nunca llama a fetch directo ni importa src/services/.
import { apiClient } from "@/shared/api-client";
import type { CreateMeetingInput, MeetingDTO } from "@/types/meeting";

export async function fetchMeetings(): Promise<MeetingDTO[]> {
  const { data } = await apiClient<{ data: MeetingDTO[] }>("/api/meetings", { cache: "no-store" });
  return data;
}

export async function createMeeting(input: CreateMeetingInput): Promise<MeetingDTO> {
  const { data } = await apiClient<{ data: MeetingDTO }>("/api/meetings", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data;
}
