/* The sizes of a mosaic's tiles. Full blocks repeat the section's own pattern;
   whatever is left over after them gets one of these, which fill their rows
   exactly at both 2 columns (phones) and 4 columns (desktop), so the bottom edge
   stays flush for any number of tiles. Index = how many are left over. */
const LAST_BLOCK: string[][] = [
  [],
  ["col-span-2 lg:col-span-4 lg:row-span-2"],
  ["lg:col-span-2 lg:row-span-2", "lg:col-span-2 lg:row-span-2"],
  ["col-span-2 row-span-2", "col-span-2", "col-span-2"],
  ["", "", "", ""],
  ["col-span-2 row-span-2", "", "", "", ""],
  ["col-span-2", "", "", "", "", "col-span-2"],
  ["col-span-2 row-span-2", "", "", "", "", "col-span-2", "col-span-2"],
  ["", "", "col-span-2", "col-span-2", "", "", "col-span-2", "col-span-2"],
];

export function tileSpan(index: number, total: number, spans: string[]) {
  const leftover = total % spans.length;
  const firstLeftover = total - leftover;
  return index < firstLeftover ? spans[index % spans.length] : LAST_BLOCK[leftover][index - firstLeftover];
}
