// Accès à l'API ewgf.gg (https://ewgf.gg/api-docs).
// Le token n'est jamais exposé ici : l'en-tête Authorization est ajouté côté
// serveur, par le proxy de vite.config.js en dev et par la fonction
// netlify/functions/ewgf.mjs en production, à partir de EWGF_TOKEN.

import { matchKey, toUnixSeconds } from "./matchIdentity";

const API_BASE = "/api/ewgf";

// Les stages arrivent sous forme d'ID numériques (100, 1200, ...) et aucune
// table de correspondance publique n'existe pour ces valeurs. Complète-la au fur
// et à mesure : tant qu'un ID est absent, le match est importé avec "Stage 1200".
const stageNames = {};

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
        rank: latest[`${sideOf(latest, tekkenId)}_dan_rank`],
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
    myRank: battle[`${mySide}_dan_rank`],
    opponentCharacter: battle[`${opponentSide}_char`],
    opponentRank: battle[`${opponentSide}_dan_rank`],
    opponentName: battle[`${opponentSide}_name`],
    stage: stageName(battle.stage_id),
    battleType: battle.battle_type,
    difficulty: "3",
    // L'API ne fournit pas le gain de points par match : à compléter à la main.
    pointsEarned: "0",
    notes: `Importé depuis ewgf.gg (${battleTypeLabel(battle.battle_type)})`,
  };
}
