import { NextResponse } from "next/server";
import { routeHandler } from "@/shared/http/route-handler";
import { patchMeetingSchema } from "@/schemas/meeting.schema";
import { patchMeetingService } from "@/src/services/meeting";

export const patchMeetingController = routeHandler(async (req: Request, ctx: { params: { id: string } }) => {
  const body = await req.json();
  const payload = patchMeetingSchema.parse(body);
  const meeting = await patchMeetingService(ctx.params.id, payload);
  return NextResponse.json({ data: meeting });
});
