export function lerpHexColor(start: number, end: number, amount: number): number {
  const t = Math.max(0, Math.min(1, amount));
  const sr = (start >> 16) & 255;
  const sg = (start >> 8) & 255;
  const sb = start & 255;
  const er = (end >> 16) & 255;
  const eg = (end >> 8) & 255;
  const eb = end & 255;
  const r = Math.round(sr + (er - sr) * t);
  const g = Math.round(sg + (eg - sg) * t);
  const b = Math.round(sb + (eb - sb) * t);
  return (r << 16) + (g << 8) + b;
}
