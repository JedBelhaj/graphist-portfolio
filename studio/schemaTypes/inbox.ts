import { Inbox } from "lucide-react";
import { defineField, defineType } from "sanity";

/* Messages sent through the website's contact form (front/src/app/api/contact).
   The site creates them; nobody makes them by hand (sanity.config.ts keeps
   them out of the "+" menu). Everything the visitor wrote is read-only:
   the only thing to do with one is tick "Dealt with", or delete it.

   Their IDs start with "inbox." on purpose: Sanity never shows a document
   with a dot in its ID to anyone who isn't signed in, so visitors' names,
   emails and messages stay out of the public API that the site reads from. */
export const message = defineType({
  name: "message",
  title: "Message",
  type: "document",
  icon: Inbox,
  fields: [
    defineField({
      name: "handled",
      title: "Dealt with",
      type: "boolean",
      description: "Tick once you've replied, to move it out of New. Then press Publish.",
      initialValue: false,
    }),
    defineField({ name: "name", title: "Name", type: "string", readOnly: true }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      readOnly: true,
      description: "Reply to this address from your own inbox.",
    }),
    defineField({ name: "service", title: "Interested in", type: "string", readOnly: true }),
    defineField({ name: "message", title: "Message", type: "text", rows: 10, readOnly: true }),
    defineField({ name: "receivedAt", title: "Received", type: "datetime", readOnly: true }),
  ],
  orderings: [{ title: "Newest first", name: "receivedDesc", by: [{ field: "receivedAt", direction: "desc" }] }],
  preview: {
    select: { name: "name", service: "service", receivedAt: "receivedAt", handled: "handled" },
    prepare: ({ name, service, receivedAt, handled }) => ({
      title: name || "No name",
      subtitle: [
        handled ? "Dealt with" : "New",
        service,
        receivedAt &&
          new Date(receivedAt).toLocaleString(undefined, {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
      ]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});

export const inboxTypes = [message];
