import { randomUUID } from "node:crypto";
import { createClient } from "next-sanity";
import { type NextRequest, NextResponse } from "next/server";
import { CONTACT_PAGE } from "@/lib/content";
import { apiVersion, dataset } from "@/sanity/env";

/* The contact form's endpoint: checks the enquiry, saves it in the studio
   (Messages), and, if email is set up too, emails it.

   Env (Vercel → Project → Settings → Environment Variables, and .env.local):
   - SANITY_WRITE_TOKEN: sanity.io/manage → the project → API → Tokens, with
     the Editor role. Server-only: never NEXT_PUBLIC_.
   - Email, optional, through Resend (resend.com; its REST API is called
     directly, so no package):
     - RESEND_API_KEY: resend.com → API Keys.
     - CONTACT_TO: the inbox that receives enquiries.
     - CONTACT_FROM: the sender. Until a domain is verified in Resend, leave
       it out: mail then comes from onboarding@resend.dev and can only reach
       the email the Resend account was made with.
     Replying to the email replies to the visitor (reply_to).

   The message counts as sent if either one worked; it fails only if both
   did (or neither is set up). Saved messages get an "inbox." ID, which
   Sanity hides from anyone not signed in (studio/schemaTypes/inbox.ts).

   Spam: `website` is a field people never see, so anything in it is a bot;
   and a form sent less than 3 seconds after the page opened wasn't typed by
   a person. Both get a normal "sent" answer, so the bot learns nothing,
   and nothing is saved or emailed. */
const FROM_DEFAULT = "Soltani Media website <onboarding@resend.dev>";
const MIN_MS = 3000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactBody = {
  name: string;
  email: string;
  service?: string;
  message: string;
  website?: string;
  elapsed?: number;
};

const ok = () => NextResponse.json({ ok: true });
const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: NextRequest) {
  let body: Partial<ContactBody>;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request");
  }

  if (body.website) return ok();
  if (typeof body.elapsed === "number" && body.elapsed < MIN_MS) return ok();

  /* One line, so a name can't add lines to the subject. */
  const name = String(body.name ?? "").replace(/\s+/g, " ").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  const service = (CONTACT_PAGE.services as readonly string[]).includes(String(body.service))
    ? String(body.service)
    : undefined;

  if (!name || name.length > 100) return bad("Please enter your name.");
  if (!EMAIL.test(email) || email.length > 200) return bad("Please enter a valid email address.");
  if (message.length < 10) return bad("Please tell us a little more (10 characters at least).");
  if (message.length > 5000) return bad("Please keep the message under 5,000 characters.");

  const fields = { name, email, service, message };
  const [saved, emailed] = await Promise.all([save(fields), send(fields)]);
  if (saved === "off" && emailed === "off") {
    console.error("[contact] neither SANITY_WRITE_TOKEN nor RESEND_API_KEY + CONTACT_TO is set");
    return bad("The form isn't set up yet. Please email us instead.", 500);
  }
  if (saved !== "ok" && emailed !== "ok") {
    return bad("Your message couldn't be sent. Please try again, or email us.", 502);
  }
  return ok();
}

type Fields = { name: string; email: string; service?: string; message: string };
type Outcome = "ok" | "off" | "failed";

/* Into the studio's Messages. */
async function save(f: Fields): Promise<Outcome> {
  const token = process.env.SANITY_WRITE_TOKEN;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!token || !projectId) return "off";
  try {
    const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
    await client.create({
      _id: `inbox.${randomUUID()}`,
      _type: "message",
      ...f,
      receivedAt: new Date().toISOString(),
      handled: false,
    });
    return "ok";
  } catch (err) {
    console.error("[contact] saving to Sanity failed:", err);
    return "failed";
  }
}

/* By email, through Resend. */
async function send({ name, email, service, message }: Fields): Promise<Outcome> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  if (!key || !to) return "off";

  const text = [`Name: ${name}`, `Email: ${email}`, service && `Interested in: ${service}`, "", message]
    .filter((l) => l !== undefined)
    .join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || FROM_DEFAULT,
        to: [to],
        reply_to: email,
        subject: `New enquiry from ${name}${service ? ` (${service})` : ""}`,
        text,
      }),
    });
    if (!res.ok) {
      console.error("[contact] Resend refused:", res.status, await res.text());
      return "failed";
    }
    return "ok";
  } catch (err) {
    console.error("[contact] Resend unreachable:", err);
    return "failed";
  }
}
