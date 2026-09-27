import {
  getMeetingByIdController,
  patchMeetingController,
  deleteMeetingController,
} from "@/src/controllers/meeting";

export async function GET(req: Request, ctx: { params: { id: string } }) {
  return getMeetingByIdController(req, ctx);
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  return patchMeetingController(req, ctx);
}

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  return deleteMeetingController(req, ctx);
}
