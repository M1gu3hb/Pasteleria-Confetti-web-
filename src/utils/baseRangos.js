// Importe de base por rangos de kilos (CAMBIOS_V2 · Fase 02 + FIX 2) — espejo del POS.
// Origen del dato: config_publica.base_rangos (JSON string de [{min_kg,max_kg,precio}]).
// Mismo cálculo que el POS para que sea idéntico en ambos lados.

export function parseBaseRangos(value) {
  let arr = value;
  if (typeof value === "string") {
    try { arr = JSON.parse(value); } catch { return []; }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((r) => ({
      min_kg: Number(r?.min_kg) || 0,
      max_kg: Number(r?.max_kg) || 0,
      precio: Number(r?.precio) || 0,
    }))
    .filter((r) => r.max_kg >= r.min_kg);
}

export function rangoMaximoKg(base_rangos) {
  return parseBaseRangos(base_rangos).reduce((m, r) => Math.max(m, r.max_kg), 0);
}

// Devuelve { importe, cotizaAparte }:
//  - dentro de un rango → { importe: precio, cotizaAparte:false } (precio puede ser 0)
//  - arriba del max más alto → { importe:0, cotizaAparte:true } (se cotiza aparte)
//  - bajo el min más chico o en un hueco → { importe:0, cotizaAparte:false } (sin base)
export function calcularImporteBase(kilos, base_rangos) {
  const k = Number(kilos) || 0;
  const rangos = parseBaseRangos(base_rangos);
  if (k <= 0 || rangos.length === 0) return { importe: 0, cotizaAparte: false };
  const ord = [...rangos].sort((a, b) => a.min_kg - b.min_kg);
  for (const r of ord) {
    if (k >= r.min_kg && k <= r.max_kg) return { importe: r.precio, cotizaAparte: false };
  }
  const ultimo = ord[ord.length - 1];
  if (k > ultimo.max_kg) return { importe: 0, cotizaAparte: true };
  return { importe: 0, cotizaAparte: false };
}
