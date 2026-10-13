import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import type { StructureResolver } from "sanity/structure";
import { singletonTypes } from "./schemaTypes/pages";

/* The admin sidebar: pages first (each opens straight into its one
   document), then the media and people lists, which are drag-to-reorder. */
const ORDERABLE: { type: string; title: string }[] = [
  { type: "photo", title: "Photos" },
  { type: "video", title: "Videos" },
  { type: "webProject", title: "Websites" },
  { type: "result", title: "Client messages" },
  { type: "testimonial", title: "Testimonials" },
  { type: "clientLogo", title: "Client logos" },
  { type: "teamMember", title: "Team" },
];

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Content")
    .items([
      ...singletonTypes.map((t) =>
        S.listItem()
          .title(t.title ?? t.name)
          .id(t.name)
          .icon(t.icon)
          .child(S.document().schemaType(t.name).documentId(t.name).title(t.title ?? t.name)),
      ),
      S.divider(),
      ...ORDERABLE.map(({ type, title }) =>
        orderableDocumentListDeskItem({ type, title, id: `orderable-${type}`, S, context }),
      ),
    ]);
