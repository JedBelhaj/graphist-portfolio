import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId: projectId || "unset", dataset });

/* Sanity image → CDN URL. `auto=format` serves WebP/AVIF to browsers that take
   it, and capping the width keeps a 6K upload from going out at full size.
   Crop and hotspot set in the studio are applied by the builder. */
export function imageUrl(source: SanityImageSource, width = 1600) {
  return builder.image(source).width(width).fit("max").auto("format").url();
}
