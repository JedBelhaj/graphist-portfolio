import nodemailer from "nodemailer";
import { type NextRequest, NextResponse } from "next/server";
import { BRAND } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import { CONTACT_PAGE } from "@/lib/content";

/* The contact form's endpoint: checks the enquiry and emails it, from the
   website's own Gmail account, to the Contact email in the studio
   (Site settings). Change that field and the form follows; nothing to
   redeploy. Replying to the email replies to the visitor (replyTo).

   Env (Vercel → Project → Settings → Environment Variables, and .env.local):
   - GMAIL_USER: the Gmail address the site sends from. A separate account
     for the website, not anyone's personal one.
   - GMAIL_APP_PASSWORD: an app password for it (Google account → Security →
     2-Step Verification on → App passwords). Not the account's password.
   - CONTACT_TO (optional): send here instead of the studio's Contact email.

   Gmail's free limit is about 500 emails a day, far more than a contact
   form needs.

   Spam: `website` is a field people never see, so anything in it is a bot;
   and a form sent less than 3 seconds after the page opened wasn't typed by
   a person. Both get a normal "sent" answer, so the bot learns nothing,
   and no email goes out. */
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

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  /* BRAND.email is a placeholder (marked MOCK in lib/brand.ts): until the
     studio holds a real address, refuse rather than mail nobody. */
  const to = process.env.CONTACT_TO || (await getContent()).brand.email;
  if (!user || !pass || !EMAIL.test(to) || to === BRAND.email) {
    console.error(
      "[contact] not set up:",
      !user || !pass ? "GMAIL_USER / GMAIL_APP_PASSWORD missing" : `no real recipient (Contact email is "${to}")`,
    );
    return bad("The form isn't set up yet. Please email us instead.", 500);
  }

  const text = [`Name: ${name}`, `Email: ${email}`, service && `Interested in: ${service}`, "", message]
    .filter((l) => l !== undefined)
    .join("\n");

  try {
    await nodemailer.createTransport({ service: "gmail", auth: { user, pass } }).sendMail({
      from: { name: `${BRAND.short} website`, address: user },
      to,
      replyTo: { name, address: email },
      subject: `New enquiry from ${name}${service ? ` (${service})` : ""}`,
      text,
    });
  } catch (err) {
    console.error("[contact] Gmail refused:", err);
    return bad("Your message couldn't be sent. Please try again, or email us.", 502);
  }

  return ok();
}
