// Lecture de la page joueur de Wavu Wank (https://wank.wavu.wiki).
// Wavu n'expose pas d'API par joueur : on lit la page publique, qui contient
// les 500 derniers matchs classés, avec la variation de points que ewgf.gg ne
// donne pas. Seule l'URL sans paramètre est accessible : les variantes
// ?before= et ?limit= sont protégées par un défi Cloudflare.

import { matchKey } from "./matchIdentity";

const API_BASE = "/api/wavu";

export class WavuError extends Error {
  constructor(message) {
    super(message);
    this.name = "WavuError";
  }
}

const rowPattern = /<tr>([\s\S]*?)<\/tr>/g;
const timePattern = /printDateTime\((\d+)\)/;
const playerPattern = /<a href="\/player\/([^"]+)">([^<]*)<\/a>/g;
const charPattern = /<span class="char">([^<]*)<\/span>/g;
const ratingPattern = /<span class="rating">\s*(\d+)\s*<span class="(?:win|lose)">\s*([+-]?\d+)/g;
const scorePattern = /<td class="result">\s*(\d+)-(\d+)\s*<\/td>/;

// Une ligne du tableau des matchs : le joueur consulté est toujours à gauche.
function parseRow(row, tekkenId) {
  const time = row.match(timePattern);
  const score = row.match(scorePattern);
  const players = [...row.matchAll(playerPattern)];
  const chars = [...row.matchAll(charPattern)];
  const ratings = [...row.matchAll(ratingPattern)];

  if (!time || !score || players.length < 2 || chars.length < 2) return null;
  if (players[0][1] !== tekkenId) return null;

  return {
    battleAt: Number(time[1]),
    myCharacter: chars[0][1],
    myRounds: Number(score[1]),
    opponentRounds: Number(score[2]),
    opponentCharacter: chars[1][1],
    opponentId: players[1][1],
    opponentName: players[1][2],
    pointsEarned: ratings[0] ? ratings[0][2] : "0",
  };
}

export async function fetchPlayerMatches(tekkenId) {
  let response;
  try {
    response = await fetch(`${API_BASE}/player/${encodeURIComponent(tekkenId)}`);
  } catch {
    throw new WavuError("Wavu Wank injoignable.");
  }

  if (!response.ok) {
    throw new WavuError(`Wavu Wank a répondu ${response.status}.`);
  }

  const html = await response.text();
  const rows = [...html.matchAll(rowPattern)]
    .map(([, row]) => parseRow(row, tekkenId))
    .filter(Boolean);

  // Un joueur inconnu renvoie une page valide mais sans tableau de matchs.
  if (rows.length === 0 && !html.includes("games")) {
    throw new WavuError("Page Wavu Wank illisible : son format a pu changer.");
  }

  return rows;
}

// Wavu n'archive que le classé, et ne connaît ni rang ni stage.
export function wavuRowToMatch(row) {
  return {
    id: matchKey(row.battleAt, row.opponentId),
    date: new Date(row.battleAt * 1000).toISOString().split("T")[0],
    result: row.myRounds > row.opponentRounds ? "win" : "loss",
    score: `${row.myRounds}-${row.opponentRounds}`,
    myCharacter: row.myCharacter,
    opponentCharacter: row.opponentCharacter,
    opponentName: row.opponentName,
    battleType: "RANKED_BATTLE",
    pointsEarned: row.pointsEarned,
    notes: "Importé depuis Wavu Wank",
  };
}
