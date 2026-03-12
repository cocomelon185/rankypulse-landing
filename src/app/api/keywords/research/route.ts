import { GET as searchGET, POST as searchPOST } from "@/app/api/keywords/search/route";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return searchGET(req);
}

export async function POST(req: Request) {
  return searchPOST(req);
}

