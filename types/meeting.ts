import type { z } from "zod";
import type { createMeetingSchema } from "@/schemas/meeting.schema";

// El input se deriva del schema de Zod: nunca se repite la forma a mano acá.
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;

// El DTO de salida extiende el input con lo que agrega el servidor (id, meetingUrl).
// Ojo: esta fusión con `&` solo es válida mientras los campos compartidos tengan el
// mismo tipo en input y output. Si `participants` alguna vez deja de ser string[] en la
// salida, se saca del `&` y se redefine a mano en el DTO (ver arquitectura del proyecto).
export type MeetingDTO = CreateMeetingInput & {
  id: string;
  meetingUrl: string;
};
