import { NextResponse } from "next/server";
import { routeHandler } from "@/shared/http/route-handler";
import { getMeetingByIdService } from "@/src/services/meeting";

export const getMeetingByIdController = routeHandler(async (_req: Request, ctx: { params: { id: string } }) => {
  const meeting = await getMeetingByIdService(ctx.params.id);
  return NextResponse.json({ data: meeting });
});
