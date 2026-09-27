import { getMeetingsController, postMeetingController } from "@/src/controllers/meeting";

export async function GET(req: Request) {
  return getMeetingsController(req);
}

export async function POST(req: Request) {
  return postMeetingController(req);
}
