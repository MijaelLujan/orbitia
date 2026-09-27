import { NextResponse } from "next/server";
import { routeHandler } from "@/shared/http/route-handler";
import { createMeetingSchema } from "@/schemas/meeting.schema";
import { createMeetingService } from "@/src/services/meeting";

export const postMeetingController = routeHandler(async (req: Request) => {
  const body = await req.json();
  const payload = createMeetingSchema.parse(body);
  const meeting = await createMeetingService(payload);
  return NextResponse.json({ data: meeting }, { status: 201 });
});
