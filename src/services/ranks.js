// Rangs de Tekken 8 : ordre, couleurs et normalisation.
// Couleurs reprises d'ewgf.gg (rankColorsAtom de leur frontend). ewgf n'en
// définit pas pour God of Destruction I à Infinity : ils héritent du magenta
// de God of Destruction.

import tekkenData from "../pages/tekkenData.json";

const GOD_OF_DESTRUCTION = "#9e0059";

const rankColors = {
  Beginner: "#99582A",
  "1st Dan": "#adb5bd",
  "2nd Dan": "#7d8597",
  Fighter: "#48cae4",
  Strategist: "#00b4d8",
  Combatant: "#0077b6",
  Brawler: "#38b000",
  Ranger: "#008000",
  Cavalry: "#006400",
  Warrior: "#ffea00",
  Assailant: "#ffd000",
  Dominator: "#ffb700",
  Vanquisher: "#ff8500",
  Destroyer: "#ff6d00",
  Eliminator: "#ff4800",
  Garyu: "#ad2831",
  Shinryu: "#800e13",
  Tenryu: "#640d14",
  "Mighty Ruler": "#7b2cbf",
  "Flame Ruler": "#5a189a",
  "Battle Ruler": "#3c096c",
  Fujin: "#014f86",
  Raijin: "#01497c",
  Kishin: "#013a63",
  Bushin: "#012a4a",
  "Tekken King": "#240046",
  "Tekken Emperor": "#240046",
  "Tekken God": "#ffe94e",
  "Tekken God Supreme": "#b69121",
};

// Effets visuels : halo doré à partir de Tekken Emperor, reflet brillant en plus
// sur Infinity.
const HALO_FROM = tekkenData.tekkenRanks.indexOf("Tekken Emperor");
const shinyRanks = ["God of Destruction Infinity"];

const byLowerCase = new Map(
  tekkenData.tekkenRanks.map((rank) => [rank.toLowerCase(), rank])
);

// ewgf écrit « God Of Destruction II » avec un O majuscule, contrairement aux
// autres rangs : on rattache chaque variante de casse au nom de référence.
export const normalizeRank = (rank) =>
  (rank && byLowerCase.get(rank.trim().toLowerCase())) || rank;

export const rankColor = (rank) => {
  const name = normalizeRank(rank);
  if (rankColors[name]) return rankColors[name];
  return name?.startsWith("God of Destruction") ? GOD_OF_DESTRUCTION : null;
};

// Texte noir sur fond clair, blanc sur fond sombre (luminance relative WCAG).
export const rankTextColor = (background) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(background.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.179 ? "#111111" : "#ffffff";
};

export const rankEffects = (rank) => {
  const name = normalizeRank(rank);
  const effects = [];
  if (tekkenData.tekkenRanks.indexOf(name) >= HALO_FROM) effects.push("halo");
  if (shinyRanks.includes(name)) effects.push("shiny");
  return effects;
};
