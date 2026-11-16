"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CircleCheck, LoaderCircle } from "lucide-react";
import { FONT_DISPLAY } from "@/lib/brand";
import { CONTACT_PAGE } from "@/lib/content";

const FIELD =
  "w-full rounded-xl border border-[rgb(10,11,16)]/15 bg-white px-4 py-3 text-base text-[rgb(10,11,16)] placeholder:text-[rgb(10,11,16)]/35 transition-colors focus:border-[rgb(124,92,252)] focus:outline-none focus:ring-2 focus:ring-[rgb(124,92,252)]/25";
const LABEL = "mb-2 block text-sm font-semibold text-[rgb(10,11,16)]";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

/* The contact form. Posts to /api/contact (which emails it) and swaps to a
   thank-you panel once sent. The browser checks the fields first (required,
   email format); the route checks them again, and its error text is what
   shows if it refuses. `website` is a hidden trap for bots, and `elapsed`
   lets the route ignore forms filled faster than a person could. */
export default function ContactForm({ email }: { email: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [service, setService] = useState<string>();
  const opened = useRef(0);
  const sentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    opened.current = Date.now();
  }, []);

  /* Move focus to the confirmation, so screen readers announce it and the
     keyboard isn't left on a button that's gone. */
  useEffect(() => {
    if (state.kind === "sent") sentRef.current?.focus();
  }, [state.kind]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          website: data.get("website"),
          service,
          elapsed: Date.now() - opened.current,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && json.ok) setState({ kind: "sent" });
      else setState({ kind: "error", message: json.error ?? "Something went wrong. Please try again." });
    } catch {
      setState({ kind: "error", message: "No connection. Check your internet and try again." });
    }
  };

  if (state.kind === "sent") {
    return (
      <div
        ref={sentRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col items-start gap-4 rounded-2xl bg-white p-8 outline-none ring-1 ring-[rgb(10,11,16)]/10 sm:p-10"
      >
        <CircleCheck size={40} className="text-[rgb(124,92,252)]" />
        <h2 className="text-3xl font-semibold tracking-tight text-[rgb(10,11,16)]" style={{ fontFamily: FONT_DISPLAY }}>
          {CONTACT_PAGE.sent.title}
        </h2>
        <p className="text-lg leading-relaxed text-[rgb(74,74,86)]">{CONTACT_PAGE.sent.body}</p>
      </div>
    );
  }

  const sending = state.kind === "sending";

  return (
    <form onSubmit={submit} className="flex flex-col gap-6 rounded-2xl bg-white p-6 ring-1 ring-[rgb(10,11,16)]/10 sm:p-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={LABEL}>
            Name
          </label>
          <input id="contact-name" name="name" required maxLength={100} autoComplete="name" className={FIELD} />
        </div>
        <div>
          <label htmlFor="contact-email" className={LABEL}>
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            className={FIELD}
          />
        </div>
      </div>

      <fieldset>
        <legend className={LABEL}>
          What do you need? <span className="font-normal text-[rgb(10,11,16)]/50">(optional)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {CONTACT_PAGE.services.map((s) => {
            const on = service === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => setService(on ? undefined : s)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(124,92,252)] ${
                  on
                    ? "bg-[rgb(118,86,248)] text-white ring-[rgb(118,86,248)]"
                    : "bg-white text-[rgb(10,11,16)] ring-[rgb(10,11,16)]/15 hover:ring-[rgb(124,92,252)]"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="contact-message" className={LABEL}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          placeholder="What are you working on, and when do you need it?"
          className={`${FIELD} resize-y`}
        />
      </div>

      {/* The bot trap: off screen and out of the tab order, so people never
          fill it. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.kind === "error" && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.message}{" "}
          <a href={`mailto:${email}`} className="font-semibold underline">
            {email}
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[rgb(118,86,248)] px-7 py-3.5 text-base font-medium text-white transition-[transform,background-color] hover:scale-[1.03] hover:bg-[rgb(104,72,236)] disabled:cursor-wait disabled:opacity-70 disabled:hover:scale-100"
      >
        {sending ? (
          <>
            <LoaderCircle size={18} className="animate-spin" /> Sending…
          </>
        ) : (
          <>
            Send message <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  );
}
