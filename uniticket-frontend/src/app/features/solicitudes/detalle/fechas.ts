/** Formato de fechas en español sin registrar LOCALE_ID (solo para el detalle). */
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const z2 = (n: number) => String(n).padStart(2, '0');

/** 05 nov 2026 */
export function fechaDia(iso: string): string {
  const d = new Date(iso);
  return `${z2(d.getDate())} ${MES[d.getMonth()]} ${d.getFullYear()}`;
}

/** 05 nov, 14:30 */
export function fechaHora(iso: string): string {
  const d = new Date(iso);
  return `${z2(d.getDate())} ${MES[d.getMonth()]}, ${z2(d.getHours())}:${z2(d.getMinutes())}`;
}

/** Días completos entre dos fechas (mínimo 0). */
export function diasEntre(desde: string, hasta: string | Date = new Date()): number {
  const ms = new Date(hasta).getTime() - new Date(desde).getTime();
  return Math.max(0, Math.floor(ms / 864e5));
}
