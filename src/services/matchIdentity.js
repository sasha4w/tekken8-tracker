// Identifiant commun aux deux sources de matchs (ewgf.gg et Wavu Wank).
// Un match est identifié par l'instant du combat et l'adversaire : les deux
// sources s'accordent sur ces deux valeurs, ce qui permet de les fusionner.

export const matchKey = (unixSeconds, opponentTekkenId) =>
  `tk-${unixSeconds}-${opponentTekkenId}`;

export const toUnixSeconds = (isoDate) =>
  Math.floor(new Date(isoDate).getTime() / 1000);

// Instant d'un match, pour le tri : l'identifiant porte l'horodatage exact, plus
// précis que la date, qui ne descend pas sous la journée. Repli sur la date pour
// les matchs saisis à la main.
export const matchTime = (match) => {
  const parsed = String(match.id).match(/^tk-(\d+)-/);
  return parsed ? Number(parsed[1]) : Date.parse(match.date) / 1000 || 0;
};

// Ancien format, antérieur à l'import Wavu : ewgf-<date ISO>-<p1>-<p2>.
const legacyId = /^ewgf-(.+Z)-([^-]+)-([^-]+)$/;

// Réécrit les identifiants hérités pour qu'un match déjà importé ne soit pas
// réimporté en double depuis l'autre source.
export function migrateMatchIds(matches, tekkenId) {
  if (!tekkenId) return matches;

  return matches.map((match) => {
    const parsed = typeof match.id === "string" && match.id.match(legacyId);
    if (!parsed) return match;

    const [, iso, p1, p2] = parsed;
    const opponent = p1 === tekkenId ? p2 : p1;
    return { ...match, id: matchKey(toUnixSeconds(iso), opponent) };
  });
}
