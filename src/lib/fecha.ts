// Fecha de hoy en Colombia como "YYYY-MM-DD".
// No usar toISOString(): devuelve la fecha UTC, que después de las 7 p.m. en Bogotá ya es mañana.
export function hoyColombia(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}
