import { type NextRequest, NextResponse } from "next/server";
import { CONTACT_PAGE } from "@/lib/content";

/* The contact form's endpoint: checks the enquiry and emails it through
   Resend (resend.com), whose REST API is called directly, so no package.

   Env (Vercel → Project → Settings → Environment Variables, and .env.local):
   - RESEND_API_KEY: from resend.com → API Keys.
   - CONTACT_TO: the inbox that receives enquiries.
   - CONTACT_FROM (optional): the sender. Until a domain is verified in
     Resend, only the default onboarding@resend.dev works, and it can only
     send to the email the Resend account was made with, so CONTACT_TO must
     be that address.

   Replying to the email replies to the visitor (reply_to).

   Spam: `website` is a field people never see, so anything in it is a bot;
   and a form sent less than 3 seconds after the page opened wasn't typed by
   a person. Both get a normal "sent" answer, so the bot learns nothing,
   and no email. */
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

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  if (!key || !to) {
    console.error("[contact] RESEND_API_KEY or CONTACT_TO is not set");
    return bad("The form isn't set up yet. Please email us instead.", 500);
  }

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
      return bad("Your message couldn't be sent. Please try again, or email us.", 502);
    }
  } catch (err) {
    console.error("[contact] Resend unreachable:", err);
    return bad("Your message couldn't be sent. Please try again, or email us.", 502);
  }

  return ok();
}
