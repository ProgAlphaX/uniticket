export function diasEntre(desde: string, hasta: string | Date): number {
  const ms = new Date(hasta).getTime() - new Date(desde).getTime();
  return Math.max(0, Math.floor(ms / 864e5));
}
