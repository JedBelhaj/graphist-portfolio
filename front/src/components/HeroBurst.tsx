import { ACCENT } from "@/lib/brand";

/* The three-stroke burst behind the hero cut-out.

   Inlined from the remote asset it used to load as an <img>, because that file
   has the old hot pink baked in as fill="#FF5F81" and an <img> gives you no way
   to recolour it — the accent swap left this one sticker pink. Now it takes a
   token like everything else.

   No width/height on the <svg>: the viewBox plus a sizing class on the caller
   keeps it scaling with the existing sticker geometry. */
export default function HeroBurst({
  className = "",
  color = ACCENT,
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 602 719"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M35.0882 337.89L177.938 37.2328C187.375 17.3702 211.981 10.1188 230.681 21.6892V21.6892C249.379 33.2578 253.874 58.508 240.318 75.8186L35.0882 337.89Z"
        fill={color}
      />
      <path
        d="M171.631 531.637L439.786 334.423C457.501 321.394 482.608 326.655 493.604 345.699V345.699C504.597 364.74 496.604 389.11 476.468 397.941L171.631 531.637Z"
        fill={color}
      />
      <path
        d="M227.736 677.83L555.409 619.254C577.057 615.385 597.262 631.189 598.721 653.131V653.131C600.179 675.069 582.249 693.407 560.283 692.442L227.736 677.83Z"
        fill={color}
      />
    </svg>
  );
}
