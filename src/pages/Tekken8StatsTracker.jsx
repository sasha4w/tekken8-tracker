import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import Header from "./../components/Header";
import Footer from "./../components/Footer";
import Tabs from "./../components/Tabs";
import ProfileTab from "../components/ProfileTab";
import StatsTab from "../components/StatsTab";
import HistoryTab from "../components/HistoryTab";
import "./tekken-styles.css";
import tekkenData from "./tekkenData.json";
import {
  battleToMatch,
  battleTypes,
  DEFAULT_BATTLE_TYPE,
  fetchBattles as fetchBattlesFromApi,
  latestRank,
  migrateStageNames,
} from "../services/ewgfApi";
import { fetchPlayerMatches, wavuRowToMatch } from "../services/wavuApi";
import { migrateMatchIds } from "../services/matchIdentity";
import { normalizeRank } from "../services/ranks";

// Ce qu'une source peut apporter à un match déjà connu. On écarte les champs
// posés une fois pour toutes à la création (notes, difficulté), les valeurs
// vides, et le "0 point" d'ewgf.gg, qui effacerait les vrais points de Wavu.
const meaningfulFields = (match) =>
  Object.fromEntries(
    Object.entries(match).filter(
      ([field, value]) =>
        !["notes", "difficulty"].includes(field) &&
        value !== "" &&
        value !== undefined &&
        !(field === "pointsEarned" && value === "0")
    )
  );

const loadProfile = () => {
  const saved = localStorage.getItem("tekken8Profile");
  return saved
    ? JSON.parse(saved)
    : {
        username: "",
        tekkenId: "",
        mainCharacter: "",
        currentRank: "",
        rankHistory: [],
      };
};

export default function Tekken8StatsTracker() {
  const [userProfile, setUserProfile] = useState(loadProfile);

  const [matches, setMatches] = useState(() => {
    const savedMatches = localStorage.getItem("tekken8Matches");
    // Les matchs importés avant Wavu portent un identifiant propre à ewgf.gg,
    // et ceux d'avant la table des stages un nom provisoire (« Stage 1200 »).
    return migrateStageNames(
      migrateMatchIds(
        savedMatches ? JSON.parse(savedMatches) : [],
        loadProfile().tekkenId
      )
    );
  });

  //// SYNCHRONISATION AVEC EWGF.GG ET WAVU WANK ////
  const [syncState, setSyncState] = useState({
    loading: false,
    errors: [],
    lastSyncAt: null,
    added: null,
    enriched: null,
  });

  const syncMatches = useCallback(async () => {
    if (!userProfile.tekkenId) return;

    setSyncState((prev) => ({ ...prev, loading: true, errors: [] }));

    // Les deux sources sont indépendantes : l'une peut échouer sans l'autre.
    const [wavu, ewgf] = await Promise.allSettled([
      fetchPlayerMatches(userProfile.tekkenId),
      fetchBattlesFromApi(userProfile.tekkenId),
    ]);

    const errors = [];
    if (wavu.status === "rejected") errors.push(wavu.reason.message);
    if (ewgf.status === "rejected") errors.push(ewgf.reason.message);

    // Wavu pose le socle (historique long et points), ewgf complète par-dessus
    // avec ce qu'il est seul à connaître : rang, stage et type de match.
    const layers = [
      wavu.status === "fulfilled" ? wavu.value.map(wavuRowToMatch) : [],
      ewgf.status === "fulfilled"
        ? ewgf.value.map((battle) => battleToMatch(battle, userProfile.tekkenId))
        : [],
    ];

    let added = 0;
    let enriched = 0;

    // La fusion se fait dans la mise à jour d'état : deux synchros simultanées
    // (StrictMode en développement) ne peuvent pas créer de doublons.
    setMatches((prev) => {
      added = 0;
      enriched = 0;
      const byId = new Map(prev.map((match) => [match.id, match]));

      layers.flat().forEach((incoming) => {
        const existing = byId.get(incoming.id);
        if (!existing) {
          byId.set(incoming.id, { difficulty: "3", pointsEarned: "0", ...incoming });
          added++;
          return;
        }

        const merged = { ...existing, ...meaningfulFields(incoming) };
        if (JSON.stringify(merged) !== JSON.stringify(existing)) {
          byId.set(incoming.id, merged);
          enriched++;
        }
      });

      return added || enriched ? [...byId.values()] : prev;
    });

    // Le rang du dernier match fait foi, et alimente la courbe de progression.
    const current =
      ewgf.status === "fulfilled"
        ? latestRank(ewgf.value, userProfile.tekkenId)
        : null;
    if (current) {
      setUserProfile((prev) =>
        prev.currentRank === current.rank
          ? prev
          : {
              ...prev,
              currentRank: current.rank,
              rankHistory: [
                ...prev.rankHistory,
                { date: current.date, rank: current.rank },
              ],
            }
      );
    }

    setSyncState({
      loading: false,
      errors,
      lastSyncAt: new Date().toISOString(),
      added,
      enriched,
    });
  }, [userProfile.tekkenId]);

  // Une synchro au chargement de l'app, et une autre si le Tekken ID change.
  // Volontairement hors de l'onglet Profil : y revenir ne doit pas consommer
  // le quota de 100 requêtes par heure.
  useEffect(() => {
    syncMatches();
  }, [syncMatches]);

  const [profileForm, setProfileForm] = useState({
    username: userProfile.username || "",
    tekkenId: userProfile.tekkenId || "",
    mainCharacter: userProfile.mainCharacter || "",
    currentRank: userProfile.currentRank || "",
  });

  const [filters, setFilters] = useState({
    myCharacter: "",
    opponentCharacter: "",
    opponentName: "",
    stage: "",
    opponentRank: "",
    battleType: DEFAULT_BATTLE_TYPE,
  });

  const [activeTab, setActiveTab] = useState("profile");

  // Utiliser les données du JSON importé
  const { tekkenCharacters, tekkenStages, tekkenRanks } = tekkenData;

  useEffect(() => {
    localStorage.setItem("tekken8Matches", JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem("tekken8Profile", JSON.stringify(userProfile));
  }, [userProfile]);

  const handleProfileInputChange = (e) => {
    const { id, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters((prev) => ({ ...prev, [id.replace("filter-", "")]: value }));
  };

  // Tout remettre à zéro, y compris le type de match, filtré sur Ranked au départ.
  const resetFilters = () =>
    setFilters({
      myCharacter: "",
      opponentCharacter: "",
      opponentName: "",
      stage: "",
      opponentRank: "",
      result: "",
      battleType: "",
    });

  const handleProfileSubmit = (e) => {
    e.preventDefault();

    // Vérifier si le rang a changé
    const rankChanged = profileForm.currentRank !== userProfile.currentRank;

    const newRankHistory = [...userProfile.rankHistory];

    // Si le rang a changé, ajouter une nouvelle entrée à l'historique
    if (rankChanged) {
      newRankHistory.push({
        date: new Date().toISOString().split("T")[0],
        rank: profileForm.currentRank,
      });
    }

    setUserProfile({
      username: profileForm.username,
      tekkenId: profileForm.tekkenId.trim(),
      mainCharacter: profileForm.mainCharacter,
      currentRank: profileForm.currentRank,
      rankHistory: newRankHistory,
    });

    alert("Profil mis à jour avec succès!");
  };

  const filteredMatches = matches.filter((match) => {
    return (
      (filters.myCharacter === "" ||
        match.myCharacter === filters.myCharacter) &&
      (filters.opponentCharacter === "" ||
        match.opponentCharacter === filters.opponentCharacter) &&
      (filters.opponentName === "" ||
        match.opponentName
          ?.toLowerCase()
          .includes(filters.opponentName.toLowerCase())) &&
      (filters.stage === "" || match.stage === filters.stage) &&
      (filters.opponentRank === "" ||
        match.opponentRank === filters.opponentRank) &&
      // Les matchs saisis à la main, antérieurs à l'import, sont comptés comme Ranked.
      (filters.battleType === "" ||
        (match.battleType || DEFAULT_BATTLE_TYPE) === filters.battleType)
    );
  });

  // Calculate Stats
  const wins = filteredMatches.filter((match) => match.result === "win").length;
  const winRate =
    filteredMatches.length > 0
      ? Math.round((wins / filteredMatches.length) * 100)
      : 0;

  const characterCounts = {};
  filteredMatches.forEach((match) => {
    if (!characterCounts[match.myCharacter]) {
      characterCounts[match.myCharacter] = 0;
    }
    characterCounts[match.myCharacter]++;
  });

  let mostPlayed = "-";
  let maxCount = 0;

  for (const [character, count] of Object.entries(characterCounts)) {
    if (count > maxCount && character) {
      mostPlayed = character;
      maxCount = count;
    }
  }

  const totalDifficulty = filteredMatches.reduce(
    (sum, match) => sum + parseInt(match.difficulty),
    0
  );
  const avgDifficulty =
    filteredMatches.length > 0
      ? (totalDifficulty / filteredMatches.length).toFixed(1)
      : "0";

  // Calculer le rang moyen des adversaires
  const getRankValue = (rank) => {
    const index = tekkenRanks.findIndex((r) => r === normalizeRank(rank));
    return index !== -1 ? index : 0;
  };

  const opponentRanks = filteredMatches
    .filter((match) => match.opponentRank)
    .map((match) => getRankValue(match.opponentRank));

  const avgOpponentRankValue =
    opponentRanks.length > 0
      ? opponentRanks.reduce((sum, val) => sum + val, 0) / opponentRanks.length
      : 0;

  const avgOpponentRank = tekkenRanks[Math.round(avgOpponentRankValue)] || "-";

  // Stats des terrains
  const stageStats = [];
  tekkenStages.forEach((stage) => {
    const stageMatches = filteredMatches.filter((m) => m.stage === stage);
    if (stageMatches.length > 0) {
      const stageWins = stageMatches.filter((m) => m.result === "win").length;
      const stageWinRate = Math.round((stageWins / stageMatches.length) * 100);
      stageStats.push({
        name: stage,
        matches: stageMatches.length,
        winRate: stageWinRate,
      });
    }
  });

  // Sort by number of matches
  stageStats.sort((a, b) => b.matches - a.matches);

  // Progression des rangs
  const rankProgressionData = userProfile.rankHistory.map((entry, index) => {
    return {
      date: entry.date,
      rankValue: getRankValue(entry.rank),
      rank: entry.rank,
    };
  });

  // Statistiques des rangs adversaires
  const opponentRankStats = [];
  tekkenRanks.forEach((rank) => {
    const rankMatches = filteredMatches.filter((m) => m.opponentRank === rank);
    if (rankMatches.length > 0) {
      const rankWins = rankMatches.filter((m) => m.result === "win").length;
      const rankWinRate = Math.round((rankWins / rankMatches.length) * 100);
      opponentRankStats.push({
        name: rank,
        matches: rankMatches.length,
        winRate: rankWinRate,
      });
    }
  });
  // Sort by rank value
  opponentRankStats.sort((a, b) => getRankValue(a.name) - getRankValue(b.name));

  // Fonction pour déterminer les titres du joueur
  const determinePlayerTitles = () => {
    // Prendre les 20 derniers matchs (ou moins s'il y en a moins)
    const recentMatches = [...filteredMatches].slice(-20);
    const titles = [];

    if (recentMatches.length < 5) return ["Débutant"]; // Titre par défaut si peu de matchs

    // Calculer les statistiques
    const recentWins = recentMatches.filter(
      (match) => match.result === "win"
    ).length;
    const recentWinRate = Math.round((recentWins / recentMatches.length) * 100);

    // Compter les différents scores
    const scoreCounts = {};
    recentMatches.forEach((match) => {
      if (!scoreCounts[match.score]) scoreCounts[match.score] = 0;
      scoreCounts[match.score]++;
    });

    // Titres basés sur le winrate
    if (recentWinRate >= 90) titles.push("Légende Vivante");
    else if (recentWinRate >= 80) titles.push("Champion Implacable");
    else if (recentWinRate >= 70) titles.push("Ascension Fulgurante");
    else if (recentWinRate >= 60) titles.push("Combattant Prometteur");
    else if (recentWinRate <= 20) titles.push("Apprenti en Difficulté");

    // Titres basés sur les scores
    const threeZeroCount = scoreCounts["3-0"] || 0;
    const threeTwoCount = scoreCounts["3-2"] || 0;
    const zeroThreeCount = scoreCounts["0-3"] || 0;

    if (threeZeroCount >= 8) titles.push("As de la Blitzkrieg");
    if (threeTwoCount >= 8) titles.push("Maître des Fins Serrées");
    if (zeroThreeCount >= 8) titles.push("Persévérant Sous Pression");

    // Titres basés sur la consistance
    const hasWinStreak = checkForWinStreak(recentMatches, 5);
    const hasLoseStreak = checkForLoseStreak(recentMatches, 5);

    if (hasWinStreak) titles.push("Sur une Lancée Victorieuse");
    if (hasLoseStreak) titles.push("Chercheur de Renouveau");

    // Titres basés sur la difficulté moyenne des adversaires
    const avgDiff =
      recentMatches.reduce(
        (sum, match) => sum + parseInt(match.difficulty),
        0
      ) / recentMatches.length;

    if (avgDiff >= 4 && recentWinRate >= 60) titles.push("Dompteur d'Élite");

    // Nouveaux titres basés sur le rang des adversaires
    const lowRankOpponents = recentMatches.filter(
      (match) => parseInt(match.opponentRank) <= 2
    );

    const lowRankWins = lowRankOpponents.filter(
      (match) => match.result === "win"
    );

    const lowRankLosses = lowRankOpponents.filter(
      (match) => match.result === "loss"
    );

    // Si au moins 30% des matchs sont contre des bas rangs et qu'on les gagne majoritairement
    if (
      lowRankOpponents.length >= recentMatches.length * 0.3 &&
      lowRankWins.length > lowRankLosses.length
    ) {
      titles.push("Farmeur de Noobs");
    }

    // Si au moins 30% des matchs sont contre des bas rangs et qu'on les perd majoritairement
    if (
      lowRankOpponents.length >= recentMatches.length * 0.3 &&
      lowRankWins.length < lowRankLosses.length
    ) {
      titles.push("Présomptueux");
    }

    return titles.length > 0 ? titles : ["Combattant Standard"];
  };

  // Fonction auxiliaire pour vérifier les séries de victoires consécutives
  const checkForWinStreak = (matches, streakLength) => {
    if (matches.length < streakLength) return false;
    let currentStreak = 0;
    for (let i = matches.length - 1; i >= 0; i--) {
      if (matches[i].result === "win") {
        currentStreak++;
        if (currentStreak >= streakLength) return true;
      } else {
        currentStreak = 0;
      }
    }
    return false;
  };

  // Fonction auxiliaire pour vérifier les séries de défaites consécutives
  const checkForLoseStreak = (matches, streakLength) => {
    if (matches.length < streakLength) return false;
    let currentStreak = 0;
    for (let i = matches.length - 1; i >= 0; i--) {
      if (matches[i].result === "loss") {
        currentStreak++;
        if (currentStreak >= streakLength) return true;
      } else {
        currentStreak = 0;
      }
    }
    return false;
  };
  return (
    <div>
      {/* Header */}
      <Header />

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="container main-content">
        {activeTab === "profile" && (
          <ProfileTab
            userProfile={userProfile}
            profileForm={profileForm}
            handleProfileInputChange={handleProfileInputChange}
            handleProfileSubmit={handleProfileSubmit}
            tekkenCharacters={tekkenCharacters}
            tekkenRanks={tekkenRanks}
            winRate={winRate}
            matches={matches}
            mostPlayed={mostPlayed}
            avgOpponentRank={avgOpponentRank}
            rankProgressionData={rankProgressionData}
            playerTitles={determinePlayerTitles()}
            syncState={syncState}
            onRefresh={syncMatches}
          />
        )}

        {activeTab === "stats" && (
          <StatsTab
            filters={filters}
            handleFilterChange={handleFilterChange}
            battleTypes={battleTypes}
            filteredMatches={filteredMatches}
            winRate={winRate}
            mostPlayed={mostPlayed}
            avgOpponentRank={avgOpponentRank}
            stageStats={stageStats}
            opponentRankStats={opponentRankStats}
            tekkenCharacters={tekkenCharacters}
            tekkenStages={tekkenStages}
            tekkenRanks={tekkenRanks}
          />
        )}

        {activeTab === "history" && (
          <HistoryTab
            filters={filters}
            handleFilterChange={handleFilterChange}
            filteredMatches={filteredMatches}
            battleTypes={battleTypes}
            resetFilters={resetFilters}
            tekkenCharacters={tekkenCharacters}
            tekkenStages={tekkenStages}
            tekkenRanks={tekkenRanks}
          />
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
