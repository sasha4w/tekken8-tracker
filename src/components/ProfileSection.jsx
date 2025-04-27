import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from "recharts";
import React, { useMemo } from "react";

export default function ProfileSection({
  userProfile,
  rankProgressionData,
  tekkenRanks,
  winRate,
  matches,
  mostPlayed,
  avgOpponentRank,
}) {
  // Fonction pour déterminer les titres du joueur
  const determinePlayerTitles = (matchesToAnalyze) => {
    // Prendre les 20 derniers matchs (ou moins s'il y en a moins)
    const recentMatches = [...matchesToAnalyze].slice(-20);
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
        (sum, match) => sum + parseInt(match.difficulty || 0),
        0
      ) / recentMatches.length;

    if (avgDiff >= 4 && recentWinRate >= 60) titles.push("Dompteur d'Élite");

    // Nouveaux titres basés sur le rang des adversaires
    const lowRankOpponents = recentMatches.filter(
      (match) => parseInt(match.opponentRank || 0) <= 2
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

  // Utiliser useMemo pour calculer les titres seulement quand les matchs changent
  const playerTitles = useMemo(() => determinePlayerTitles(matches), [matches]);

  return (
    <>
      {/* Affichage des titres du joueur */}
      {playerTitles && playerTitles.length > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2>Titres du combattant</h2>
          <div className="titles-container">
            {playerTitles.map((title, index) => (
              <div key={index} className="player-title active">
                {title}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2>Mon Profil</h2>
        {/* Infos du profil */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="profile-stat-card">
            <h3 className="stat-title">Pseudo</h3>
            <div className="stat-value">{userProfile.username || "-"}</div>
          </div>
          <div className="profile-stat-card">
            <h3 className="stat-title">Personnage principal</h3>
            <div className="stat-value">{userProfile.mainCharacter || "-"}</div>
          </div>
          <div className="profile-stat-card">
            <h3 className="stat-title">Rang actuel</h3>
            <div className="stat-value">{userProfile.currentRank || "-"}</div>
          </div>
        </div>
        {/* Progression de rang */}
        <div style={{ marginTop: "1.5rem" }}>
          <h3>Progression de rang</h3>
          <div className="chart-container">
            {rankProgressionData.length > 1 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={rankProgressionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="date" stroke="#cbd5e0" />
                  <YAxis
                    domain={[0, tekkenRanks.length - 1]}
                    stroke="#cbd5e0"
                    ticks={[0, 10, 20, 30]}
                    tickFormatter={(value) => tekkenRanks[value] || value}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #800000",
                    }}
                    labelStyle={{ color: "#edf2f7" }}
                    formatter={(value) => [tekkenRanks[value], "Rang"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="rankValue"
                    stroke="#ff3333"
                    fill="#ff333333"
                    name="Rang"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                Pas assez de données pour afficher la progression du rang
              </div>
            )}
          </div>
        </div>
        {/* Statistiques générales */}
        <div style={{ marginTop: "1.5rem" }}>
          <h3>Statistiques Générales</h3>
          <div className="grid grid-cols-1 md:grid-cols-4">
            <div className="stat-card">
              <h3 className="stat-title">Win Rate</h3>
              <div className="stat-value">{winRate}%</div>
            </div>
            <div className="stat-card">
              <h3 className="stat-title">Total des matchs</h3>
              <div className="stat-value">{matches.length}</div>
            </div>
            <div className="stat-card">
              <h3 className="stat-title">Personnage le plus joué</h3>
              <div className="stat-value">{mostPlayed}</div>
            </div>
            <div className="stat-card">
              <h3 className="stat-title">Rang moyen des adversaires</h3>
              <div className="stat-value">{avgOpponentRank}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
