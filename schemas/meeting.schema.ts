import { z } from "zod";

export const createMeetingSchema = z.object({
  title: z.string().trim().min(2).max(120),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  participants: z.array(z.string().email()).min(1),
  notes: z.string().max(2000).optional(),
});

export const patchMeetingSchema = createMeetingSchema.partial();
