// Accès à l'API ewgf.gg (https://ewgf.gg/api-docs).
// Le token n'est jamais exposé ici : l'en-tête Authorization est ajouté côté
// serveur, par le proxy de vite.config.js en dev et par la fonction
// netlify/functions/ewgf.mjs en production, à partir de EWGF_TOKEN.

import { matchKey, toUnixSeconds } from "./matchIdentity";
import { normalizeRank } from "./ranks";

const API_BASE = "/api/ewgf";

// L'ID d'un stage vaut son numéro interne dans le jeu × 100 (st17_Sea -> 1700),
// +1 pour sa variante (st01_Arena_Battle1 -> 101). Sources : la table du
// backend d'ewgf.gg pour les stages de base, les fichiers internes listés sur
// Tekken Warehouse et la date d'apparition de chaque ID dans les replays Wavu
// pour les stages DLC. Les noms suivent tekkenStages, pour le filtre Terrain.
const stageNames = {
  100: "Arena",
  101: "Arena (Underground)",
  200: "Urban Square",
  201: "Urban Square (Evening)",
  300: "Yakushima",
  400: "Coliseum of Fate",
  500: "Rebel Hangar",
  600: "Pac-Pixels",
  700: "Fallen Destiny",
  900: "Descent into Subconscious",
  1000: "Sanctum",
  1100: "Into the Stratosphere",
  1200: "Ortiz Farm",
  1300: "Celebration on the Seine",
  1400: "Secluded Training Ground",
  1500: "Elegant Palace",
  1600: "Midnight Siege",
  1700: "Seaside Resort",
  1800: "Genmaji Temple",
  1801: "Genmaji Temple (daytime)",
  1900: "Phoenix Gate",
  2200: "Baobab Horizon",
};

const battleTypeLabels = {
  RANKED_BATTLE: "Ranked",
  PLAYER_BATTLE: "Player",
  QUICK_BATTLE: "Quick",
};

// Types proposés dans le filtre. Les matchs saisis avant l'import automatique
// n'ont pas de type : ils sont comptés comme Ranked.
export const DEFAULT_BATTLE_TYPE = "RANKED_BATTLE";

export const battleTypes = Object.entries(battleTypeLabels).map(
  ([value, label]) => ({ value, label })
);

// Côté du joueur dans une bataille : il peut être en p1 comme en p2.
const sideOf = (battle, tekkenId) =>
  battle.p1_tekken_id === tekkenId ? "p1" : "p2";

export class EwgfApiError extends Error {
  constructor(message) {
    super(message);
    this.name = "EwgfApiError";
  }
}

export const stageName = (stageId) => stageNames[stageId] || `Stage ${stageId}`;

// Les matchs importés avant la table des stages portent « Stage 1200 » :
// on les renomme, sans quoi seuls les 50 derniers seraient corrigés à la synchro.
export const migrateStageNames = (matches) =>
  matches.map((match) => {
    const parsed = /^Stage (\d+)$/.exec(match.stage || "");
    return parsed && stageNames[parsed[1]]
      ? { ...match, stage: stageNames[parsed[1]] }
      : match;
  });

export const battleTypeLabel = (battleType) =>
  battleTypeLabels[battleType] || battleType;

// Identifiant commun aux deux sources, pour pouvoir fusionner avec Wavu Wank.
export const battleId = (battle, tekkenId) =>
  matchKey(
    toUnixSeconds(battle.battle_at),
    battle[`${sideOf(battle, tekkenId) === "p1" ? "p2" : "p1"}_tekken_id`]
  );

const errorMessage = (response) => {
  switch (response.status) {
    case 401:
    case 403:
      return "Clé API ewgf.gg refusée. Vérifie EWGF_TOKEN (.env.local en dev, variables d'environnement Netlify en production).";
    case 404:
      // Une page HTML signale que la route /api/ewgf n'existe pas sur ce serveur
      // (proxy absent), pas que le Tekken ID est inconnu d'ewgf.gg.
      return response.headers.get("Content-Type")?.includes("json")
        ? "Tekken ID introuvable sur ewgf.gg. Vérifie l'ID saisi dans ton profil."
        : "Route /api/ewgf introuvable sur ce serveur : le proxy vers ewgf.gg n'est pas configuré.";
    case 429: {
      const reset = response.headers.get("X-Ratelimit-Reset");
      const until = reset
        ? ` Réessaie après ${new Date(reset).toLocaleTimeString()}.`
        : "";
      return `Quota horaire ewgf.gg dépassé (100 requêtes/h en gratuit).${until}`;
    }
    default:
      return `L'API ewgf.gg a répondu ${response.status}.`;
  }
};

// Renvoie les 50 derniers matchs du joueur (offre gratuite : 24 h de décalage).
export async function fetchBattles(tekkenId) {
  let response;
  try {
    response = await fetch(
      `${API_BASE}/battles/${encodeURIComponent(tekkenId)}`
    );
  } catch {
    throw new EwgfApiError(
      "Impossible de joindre l'API ewgf.gg. Vérifie ta connexion internet."
    );
  }

  if (!response.ok) {
    throw new EwgfApiError(errorMessage(response));
  }

  const payload = await response.json();
  return payload.data || [];
}

// Rang du joueur lors de sa bataille la plus récente, pour tenir le profil à jour.
export function latestRank(battles, tekkenId) {
  const latest = battles.reduce(
    (newest, battle) =>
      !newest || battle.battle_at > newest.battle_at ? battle : newest,
    null
  );

  return latest
    ? {
        rank: normalizeRank(latest[`${sideOf(latest, tekkenId)}_dan_rank`]),
        date: latest.battle_at.split("T")[0],
      }
    : null;
}

// Convertit une bataille ewgf.gg en match au format de l'application.
// Le joueur peut être en p1 ou en p2 : on le repère par son Tekken ID.
export function battleToMatch(battle, tekkenId) {
  const mySide = sideOf(battle, tekkenId);
  const opponentSide = mySide === "p1" ? "p2" : "p1";

  const myRounds = battle[`${mySide}_rounds_won`];
  const opponentRounds = battle[`${opponentSide}_rounds_won`];
  const winnerSide = battle.winner === 1 ? "p1" : "p2";

  return {
    id: battleId(battle, tekkenId),
    date: battle.battle_at.split("T")[0],
    result: winnerSide === mySide ? "win" : "loss",
    score: `${myRounds}-${opponentRounds}`,
    myCharacter: battle[`${mySide}_char`],
    myRank: normalizeRank(battle[`${mySide}_dan_rank`]),
    opponentCharacter: battle[`${opponentSide}_char`],
    opponentRank: normalizeRank(battle[`${opponentSide}_dan_rank`]),
    opponentName: battle[`${opponentSide}_name`],
    stage: stageName(battle.stage_id),
    battleType: battle.battle_type,
    difficulty: "3",
    // L'API ne fournit pas le gain de points par match : à compléter à la main.
    pointsEarned: "0",
    notes: `Importé depuis ewgf.gg (${battleTypeLabel(battle.battle_type)})`,
  };
}
