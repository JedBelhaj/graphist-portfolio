import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { SANITY_TAG } from "@/sanity/client";

/* Publish webhook (optional). Without it, edits show up within 60 seconds;
   with it, on the next page view.

   Set up on sanity.io/manage → API → Webhooks: URL https://<site>/api/revalidate,
   trigger on create/update/delete, HTTP method POST, and the same secret as
   SANITY_REVALIDATE_SECRET. The signature check rejects anyone else. */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "SANITY_REVALIDATE_SECRET is not set" }, { status: 500 });
  }

  try {
    /* The third argument waits out the CDN's eventual consistency — webhooks
       fire before the CDN updates, so an immediate re-fetch could pick up the
       old version. */
    const { isValidSignature } = await parseBody(req, secret, true);
    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    revalidateTag(SANITY_TAG);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    console.error("[revalidate]", err);
    return NextResponse.json({ message: "Could not process webhook" }, { status: 500 });
  }
}
