import React from "react";
import {
  normalizeRank,
  rankColor,
  rankEffects,
  rankTextColor,
} from "../services/ranks";

// Pastille aux couleurs ewgf.gg. Un rang inconnu reste en texte brut plutôt
// que de recevoir une couleur fausse.
export default function RankBadge({ rank }) {
  if (!rank) return null;

  const name = normalizeRank(rank);
  const background = rankColor(name);
  if (!background) return <span>{name}</span>;

  const effects = rankEffects(name).map((effect) => ` rank-badge-${effect}`);
  return (
    <span
      className={`rank-badge${effects.join("")}`}
      style={{ backgroundColor: background, color: rankTextColor(background) }}
    >
      {name}
    </span>
  );
}
