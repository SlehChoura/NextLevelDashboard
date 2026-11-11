/**
 * Accorde un libellé avec un nombre, à la française (0 et 1 au singulier) :
 * `plural(1, "action ouverte", "actions ouvertes")` → « 1 action ouverte ».
 */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${Math.abs(count) < 2 ? singular : pluralForm}`
}
