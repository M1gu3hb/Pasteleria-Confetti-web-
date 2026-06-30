// Rellenos con tipo (CAMBIOS_V2 · Fase 03) — espejo del POS.
//   - 'plano'       → suma un extra fijo (monto) al total.
//   - 'precio_kilo' → cambia el precio por kilo del pastel (monto = precio/kilo final).
// Retro-compat: rellenos viejos (solo `precio_kilo`) → { tipo:'plano', monto:precio_kilo }.

export function normalizarRelleno(r) {
  if (!r) return null;
  const tipo = r.tipo === "precio_kilo" ? "precio_kilo" : "plano";
  const monto = (r.monto != null && r.monto !== "")
    ? Number(r.monto) || 0
    : Number(r.precio_kilo) || 0;
  return { id: r.id, nombre: r.nombre, activo: r.activo === true, tipo, monto };
}
