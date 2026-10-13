import { ACCENT } from "@/lib/brand";

/* Renders CMS text with **double asterisks** as bold purple — the one bit of
   inline styling the copy uses, without handing editors a full rich-text
   editor. Splitting on a capturing group puts every marked phrase at an odd
   index. */
export default function Highlight({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 ? (
          <span key={i} className="font-bold" style={{ color: ACCENT }}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
