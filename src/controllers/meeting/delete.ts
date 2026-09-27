import { NextResponse } from "next/server";
import { routeHandler } from "@/shared/http/route-handler";
import { deleteMeetingService } from "@/src/services/meeting";

export const deleteMeetingController = routeHandler(async (_req: Request, ctx: { params: { id: string } }) => {
  const meeting = await deleteMeetingService(ctx.params.id);
  return NextResponse.json({ data: meeting });
});
