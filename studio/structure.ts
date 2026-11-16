import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { Camera, Film, FileText, Inbox, MessageSquareQuote } from "lucide-react";
import type { ConfigContext } from "sanity";
import type { StructureBuilder, StructureResolver } from "sanity/structure";
import { singletonTypes } from "./schemaTypes/pages";

/* The admin sidebar, grouped so it's short: contact-form messages on top,
   then the work (Videos, Photos, Websites…), then the reviews, the team,
   the pages and the site settings. Every list but Messages is
   drag-to-reorder, and the site shows them in that order. */

type Ctx = { S: StructureBuilder; context: ConfigContext };

const orderable = ({ S, context }: Ctx, type: string, title: string, id = `orderable-${type}`, filter?: string) =>
  orderableDocumentListDeskItem({ type, title, id, filter, S, context });

/* Videos ▸ and Photos ▸: the categories (drag to reorder them; open one to
   see and change what's in it), everything, and what has no category yet. */
const media = (ctx: Ctx, kind: "video" | "photo", title: string, icon: typeof Film) =>
  ctx.S.listItem()
    .title(title)
    .id(`${kind}-group`)
    .icon(icon)
    .child(
      ctx.S.list()
        .title(title)
        .items([
          orderable(ctx, `${kind}Category`, "Categories"),
          orderable(ctx, kind, `All ${title.toLowerCase()}`),
          orderable(ctx, kind, "No category", `orderable-${kind}-uncategorised`, "!defined(category._ref)"),
        ]),
    );

/* Messages ▸ New / All: what came in through the website's contact form,
   newest first. */
const messages = (S: StructureBuilder) => {
  const list = (title: string, filter: string) =>
    S.documentTypeList("message")
      .title(title)
      .filter(filter)
      .defaultOrdering([{ field: "receivedAt", direction: "desc" }]);
  return S.listItem()
    .title("Messages")
    .id("messages")
    .icon(Inbox)
    .child(
      S.list()
        .title("Messages")
        .items([
          S.listItem()
            .title("New")
            .id("messages-new")
            .icon(Inbox)
            .child(list("New", '_type == "message" && handled != true')),
          S.listItem().title("All").id("messages-all").child(list("All messages", '_type == "message"')),
        ]),
    );
};

const page = (S: StructureBuilder, t: (typeof singletonTypes)[number]) =>
  S.listItem()
    .title(t.title ?? t.name)
    .id(t.name)
    .icon(t.icon)
    .child(S.document().schemaType(t.name).documentId(t.name).title(t.title ?? t.name));

export const structure: StructureResolver = (S, context) => {
  const ctx = { S, context };
  const settings = singletonTypes.find((t) => t.name === "siteSettings");
  const pages = singletonTypes.filter((t) => t.name !== "siteSettings");

  return S.list()
    .title("Content")
    .items([
      messages(S),
      S.divider(),
      media(ctx, "video", "Videos", Film),
      media(ctx, "photo", "Photos", Camera),
      orderable(ctx, "webProject", "Websites"),
      orderable(ctx, "portfolioItem", "Portfolio projects"),
      S.listItem()
        .title("Reviews")
        .id("reviews")
        .icon(MessageSquareQuote)
        .child(
          S.list()
            .title("Reviews")
            .items([
              orderable(ctx, "testimonial", "Testimonials"),
              orderable(ctx, "result", "Client messages"),
              orderable(ctx, "clientLogo", "Client logos"),
            ]),
        ),
      orderable(ctx, "teamMember", "Team"),
      S.divider(),
      S.listItem()
        .title("Pages")
        .id("pages")
        .icon(FileText)
        .child(
          S.list()
            .title("Pages")
            .items(pages.map((t) => page(S, t))),
        ),
      ...(settings ? [page(S, settings)] : []),
    ]);
};
