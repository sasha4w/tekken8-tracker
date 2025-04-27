import { useState, useEffect } from "react";
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
import FormTab from "../components/FormTab";
import StatsTab from "../components/StatsTab";
import HistoryTab from "../components/HistoryTab";
import "./tekken-styles.css";
import tekkenData from "./tekkenData.json";

export default function Tekken8StatsTracker() {
  const [matches, setMatches] = useState(() => {
    const savedMatches = localStorage.getItem("tekken8Matches");
    return savedMatches ? JSON.parse(savedMatches) : [];
  });

  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem("tekken8Profile");
    return savedProfile
      ? JSON.parse(savedProfile)
      : {
          username: "",
          mainCharacter: "",
          currentRank: "",
          rankHistory: [],
        };
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    result: "win",
    score: "3-0",
    myCharacter: userProfile.mainCharacter || "", // Préremplir avec le perso principal
    myRank: userProfile.currentRank || "",
    opponentCharacter: "",
    opponentRank: "",
    opponentName: "",
    stage: "",
    difficulty: "3",
    notes: "",
    pointsEarned: "0", // Nouveau champ
  });

  const [profileForm, setProfileForm] = useState({
    username: userProfile.username || "",
    mainCharacter: userProfile.mainCharacter || "",
    currentRank: userProfile.currentRank || "",
  });

  const [filters, setFilters] = useState({
    myCharacter: "",
    opponentCharacter: "",
    opponentName: "",
    stage: "",
    opponentRank: "",
  });

  const [activeTab, setActiveTab] = useState("form");

  // Utiliser les données du JSON importé
  const { tekkenCharacters, tekkenStages, tekkenRanks } = tekkenData;

  // Scores disponibles en fonction du résultat
  const getAvailableScores = () => {
    if (formData.result === "win") {
      return [
        { value: "3-0", label: "3-0" },
        { value: "3-1", label: "3-1" },
        { value: "3-2", label: "3-2" },
      ];
    } else {
      return [
        { value: "2-3", label: "2-3" },
        { value: "1-3", label: "1-3" },
        { value: "0-3", label: "0-3" },
      ];
    }
  };

  useEffect(() => {
    localStorage.setItem("tekken8Matches", JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem("tekken8Profile", JSON.stringify(userProfile));
    // Mettre à jour le rank par défaut dans le formulaire quand le profil change
    setFormData((prev) => ({ ...prev, myRank: userProfile.currentRank }));
  }, [userProfile]);

  // Réinitialiser le score lorsque le résultat change
  useEffect(() => {
    const scores = getAvailableScores();
    if (scores.length > 0 && !scores.some((s) => s.value === formData.score)) {
      setFormData((prev) => ({ ...prev, score: scores[0].value }));
    }
  }, [formData.result]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleProfileInputChange = (e) => {
    const { id, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters((prev) => ({ ...prev, [id.replace("filter-", "")]: value }));
  };

  // Modifier la fonction handleSubmit pour gérer l'édition
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditing) {
      // Mode édition - mettre à jour le match existant
      const updatedMatches = matches.map((match) =>
        match.id === editingMatchId
          ? { ...formData, id: editingMatchId }
          : match
      );
      setMatches(updatedMatches);

      // Réinitialiser le mode édition
      setIsEditing(false);
      setEditingMatchId(null);
    } else {
      // Mode ajout - créer un nouveau match
      const newMatch = { id: Date.now(), ...formData };
      setMatches((prev) => [...prev, newMatch]);
    }

    // Réinitialiser partiellement le formulaire
    setFormData({
      ...formData,
      date: new Date().toISOString().split("T")[0],
      opponentName: "",
      notes: "",
    });
  };
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
      mainCharacter: profileForm.mainCharacter,
      currentRank: profileForm.currentRank,
      rankHistory: newRankHistory,
    });

    alert("Profil mis à jour avec succès!");
  };

  const deleteMatch = (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce match ?")) {
      setMatches((prev) => prev.filter((match) => match.id !== id));
    }
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
        match.opponentRank === filters.opponentRank)
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
    const index = tekkenRanks.findIndex((r) => r === rank);
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

  // Character Stats
  const characterStats = [];
  tekkenCharacters.forEach((character) => {
    const charMatches = filteredMatches.filter(
      (m) => m.opponentCharacter === character
    );
    if (charMatches.length > 0) {
      const charWins = charMatches.filter((m) => m.result === "win").length;
      const charWinRate = Math.round((charWins / charMatches.length) * 100);
      characterStats.push({
        name: character,
        matches: charMatches.length,
        winRate: charWinRate,
      });
    }
  });

  // Sort by number of matches
  characterStats.sort((a, b) => b.matches - a.matches);

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

  // Recent matches winrate trend (last 10)
  const recentMatches = [...filteredMatches].slice(-10);
  const winRateTrend = [];
  let trendWins = 0;

  recentMatches.forEach((match, index) => {
    if (match.result === "win") trendWins++;
    winRateTrend.push({
      match: `Match ${index + 1}`,
      winRate: Math.round((trendWins / (index + 1)) * 100),
    });
  });

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
  // Ajouter cette fonction dans le composant Tekken8StatsTracker
  const editMatch = (matchId) => {
    // Trouver le match à modifier
    const matchToEdit = matches.find((match) => match.id === matchId);

    if (matchToEdit) {
      // Mettre à jour le formData avec les données du match
      setFormData({ ...matchToEdit });

      // Basculer vers l'onglet de formulaire
      setActiveTab("form");

      // Vous pouvez également ajouter un état pour suivre si nous sommes en mode édition
      setIsEditing(true);
      setEditingMatchId(matchId);
    }
  };

  // Ajouter ces états au début du composant
  const [isEditing, setIsEditing] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState(null);

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
          />
        )}
        {activeTab === "form" && (
          <FormTab
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            tekkenCharacters={tekkenCharacters}
            tekkenRanks={tekkenRanks}
            tekkenStages={tekkenStages}
            getAvailableScores={getAvailableScores}
            userProfile={userProfile} // Nouvelle prop
          />
        )}

        {activeTab === "stats" && (
          <StatsTab
            filters={filters}
            handleFilterChange={handleFilterChange}
            filteredMatches={filteredMatches}
            winRate={winRate}
            mostPlayed={mostPlayed}
            avgOpponentRank={avgOpponentRank}
            characterStats={characterStats}
            stageStats={stageStats}
            winRateTrend={winRateTrend}
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
            deleteMatch={deleteMatch}
            editMatch={editMatch}
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
