import { ACCENT } from "@/lib/brand";

/* A brush-marker zigzag running diagonally downhill behind the hero cut-out's head.
   The stroke swells from a thin start to its fullest in the middle and thins
   out again at the end; along the way the upstrokes run a little heavier than
   the ones that drop back down.

   The SVG is cropped tight to the drawing and keeps its own aspect ratio, so
   the caller places it with a left/top/width in percentages of the photo, the
   same way the stickers are placed. That holds whatever crop the photo gets in
   the studio. */

/* The turning points of the zigzag: start, then alternating peak / trough,
   then a little closing hook. Traced from a hand sketch. */
const POINTS: [number, number][] = [
  [70, 685], [343, 451], [213, 739], [650, 400], [546, 709], [936, 409],
  [837, 715], [1214, 421], [1175, 730], [1539, 439], [1487, 685], [1617, 589],
];

const TILT = 30; // degrees the whole zigzag is turned, so it runs downhill to the right
const W_THIN = 80; // stroke width at the fullest point, on a downstroke
const W_THICK = 150; // ... and on an upstroke
const W_ENDS = 0; // width at the two ends, as a share of the middle
const STEP = 17; // spacing of the brush dabs along the line
const BLUR = 100; // smoothing passes that round off the turns
const SMOOTH = 200; // how far along the line a width change blends

/* Centripetal Catmull-Rom through the points: a smooth line that stays close
   to the sketch without overshooting at the turns. */
function spline(pts: [number, number][], per = 200) {
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  const out: [number, number][] = [];
  const knot = (a: number[], b: number[]) => Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])) || 1e-4;
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    const t1 = knot(p0, p1);
    const t2 = t1 + knot(p1, p2);
    const t3 = t2 + knot(p2, p3);
    for (let k = 0; k < per; k++) {
      const t = t1 + ((t2 - t1) * k) / per;
      const mix = (a: number[], b: number[], ta: number, tb: number) =>
        [0, 1].map((j) => ((tb - t) * a[j] + (t - ta) * b[j]) / (tb - ta));
      const a1 = mix(p0, p1, 0, t1);
      const a2 = mix(p1, p2, t1, t2);
      const a3 = mix(p2, p3, t2, t3);
      const [x, y] = mix(mix(a1, a2, 0, t2), mix(a2, a3, t1, t3), t1, t2);
      out.push([x, y]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/* Resample evenly along the line, then blur the positions so the turns come
   out as rounded loops rather than points. The ends stay pinned. */
function resample(line: [number, number][]) {
  const pts = [line[0]];
  let carry = 0;
  for (let i = 1; i < line.length; i++) {
    let [ax, ay] = line[i - 1];
    const [bx, by] = line[i];
    let seg = Math.hypot(bx - ax, by - ay);
    while (carry + seg >= STEP) {
      const t = (STEP - carry) / seg;
      ax += (bx - ax) * t;
      ay += (by - ay) * t;
      pts.push([ax, ay]);
      seg = Math.hypot(bx - ax, by - ay);
      carry = 0;
    }
    carry += seg;
  }
  pts.push(line[line.length - 1]);

  for (let pass = 0; pass < BLUR; pass++) {
    const src = pts.map((p) => [...p]);
    for (let i = 1; i < pts.length - 1; i++) {
      pts[i] = [0, 1].map((j) => (src[i - 1][j] + 2 * src[i][j] + src[i + 1][j]) / 4) as [number, number];
    }
  }
  return pts;
}

/* The outline, as one filled path: a tapered capsule between each pair of
   neighbouring dabs. They are all wound the same way, so the default nonzero
   fill merges them into a single smooth stroke. */
/* Turn a vector by TILT. */
function turn([x, y]: [number, number]): [number, number] {
  const a = (TILT * Math.PI) / 180;
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
}

function scribblePath() {
  const pts = resample(spline(POINTS.map(turn)));
  const n = pts.length;
  /* The sketch's upstroke direction, turned along with it. */
  const up = turn([1 / Math.hypot(1, 0.6), -0.6 / Math.hypot(1, 0.6)]);

  /* Raw width per dab from which way the line is heading. */
  let length = 0;
  const dabs = pts.map(([x, y], i) => {
    if (i > 0) length += Math.hypot(x - pts[i - 1][0], y - pts[i - 1][1]);
    const [ax, ay] = pts[Math.max(0, i - 1)];
    const [bx, by] = pts[Math.min(n - 1, i + 1)];
    const climb = ((bx - ax) * up[0] + (by - ay) * up[1]) / (Math.hypot(bx - ax, by - ay) || 1);
    const k = Math.min(1, Math.max(0, (climb + 0.2) / 1.1));
    return { x, y, at: length, r: 0, raw: W_THIN + (W_THICK - W_THIN) * k * k * (3 - 2 * k) };
  });

  /* Blend the widths along the line, then swell them: thin at both ends,
     fullest in the middle. */
  for (const d of dabs) {
    let sum = 0;
    let weight = 0;
    for (const e of dabs) {
      const w = Math.exp(-(((e.at - d.at) / SMOOTH) ** 2));
      sum += w * e.raw;
      weight += w;
    }
    const u = d.at / length;
    const swell = W_ENDS + (1 - W_ENDS) * Math.sin(Math.PI * u) ** 0.8;
    d.r = ((sum / weight) * swell) / 2;
  }

  const r = Math.round;
  const box = [
    Math.min(...dabs.map((d) => d.x - d.r)),
    Math.min(...dabs.map((d) => d.y - d.r)),
    Math.max(...dabs.map((d) => d.x + d.r)),
    Math.max(...dabs.map((d) => d.y + d.r)),
  ].map(r);
  let path = "";
  for (let i = 0; i < n - 1; i++) {
    const a = dabs[i];
    const b = dabs[i + 1];
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    if (dist < 1e-3) continue;
    const dir = Math.atan2(b.y - a.y, b.x - a.x);
    const spread = Math.acos(Math.max(-1, Math.min(1, (a.r - b.r) / dist)));
    const on = (d: typeof a, ang: number) => `${r(d.x + d.r * Math.cos(ang))} ${r(d.y + d.r * Math.sin(ang))}`;
    path += `M${on(a, dir + spread)}L${on(b, dir + spread)}`;
    path += `A${r(b.r)} ${r(b.r)} 0 ${spread > Math.PI / 2 ? 1 : 0} 0 ${on(b, dir - spread)}L${on(a, dir - spread)}`;
    /* Only the first capsule needs its back cap; every later one is covered
       by the front cap of the one before it. */
    path += i === 0 ? `A${r(a.r)} ${r(a.r)} 0 ${spread < Math.PI / 2 ? 1 : 0} 0 ${on(a, dir + spread)}Z` : "Z";
  }
  return { path, viewBox: `${box[0]} ${box[1]} ${box[2] - box[0]} ${box[3] - box[1]}` };
}

const { path: PATH, viewBox: VIEW_BOX } = scribblePath();

export default function HeroScribble({
  className = "",
  color = ACCENT,
  delay = 0,
}: {
  className?: string;
  color?: string;
  /* ms before the scribble wipes in. */
  delay?: number;
}) {
  return (
    <svg
      viewBox={VIEW_BOX}
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d={PATH} fill={color} className="scribble-in" style={{ animationDelay: `${delay}ms` }} />
    </svg>
  );
}
