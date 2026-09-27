import { NextResponse } from "next/server";
import { routeHandler } from "@/shared/http/route-handler";
import { getAllMeetingsService } from "@/src/services/meeting";

export const getMeetingsController = routeHandler(async () => {
  const meetings = await getAllMeetingsService();
  return NextResponse.json({ data: meetings });
});
