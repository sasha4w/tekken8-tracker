import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import ActivityHeatmap from "./ActivityHeatmap";

export default function StatsTab({
  filters,
  handleFilterChange,
  filteredMatches,
  winRate,
  mostPlayed,
  avgOpponentRank,
  characterStats,
  stageStats,
  winRateTrend,
  opponentRankStats,
  tekkenCharacters,
  tekkenStages,
  tekkenRanks,
}) {
  // Calculate streaks
  const calculateStreaks = () => {
    const matches = [...filteredMatches].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    let currentWinStreak = 0;
    let currentLoseStreak = 0;
    let maxWinStreak = 0;
    let maxLoseStreak = 0;

    // Calculate current streak - need to check from newest to oldest
    const reversedMatches = [...matches].reverse();
    for (let i = 0; i < reversedMatches.length; i++) {
      if (i === 0) {
        if (reversedMatches[i].result === "win") {
          currentWinStreak = 1;
        } else {
          currentLoseStreak = 1;
        }
      } else {
        if (reversedMatches[i].result === reversedMatches[i - 1].result) {
          if (reversedMatches[i].result === "win") {
            currentWinStreak++;
          } else {
            currentLoseStreak++;
          }
        } else {
          break;
        }
      }
    }

    // Calculate max streaks
    let tempWinStreak = 0;
    let tempLoseStreak = 0;

    for (let i = 0; i < matches.length; i++) {
      if (matches[i].result === "win") {
        tempWinStreak++;
        tempLoseStreak = 0;
      } else {
        tempLoseStreak++;
        tempWinStreak = 0;
      }

      maxWinStreak = Math.max(maxWinStreak, tempWinStreak);
      maxLoseStreak = Math.max(maxLoseStreak, tempLoseStreak);
    }

    return {
      currentWinStreak,
      currentLoseStreak,
      maxWinStreak,
      maxLoseStreak,
    };
  };

  const streaks = calculateStreaks();

  // Format winrate trend data to use dates instead of "Match X"
  const formatWinRateTrendData = () => {
    const recentMatches = [...filteredMatches]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-10);

    let trendWins = 0;
    return recentMatches.map((match, index) => {
      if (match.result === "win") trendWins++;
      return {
        date: match.date,
        winRate: Math.round((trendWins / (index + 1)) * 100),
      };
    });
  };

  const winRateTrendData = formatWinRateTrendData();

  return (
    <div>
      {/* Filtres */}
      <div className="card">
        <h2>Filtres</h2>
        <div className="filter-grid">
          <div>
            <label htmlFor="filter-myCharacter">Mon personnage</label>
            <select
              id="filter-myCharacter"
              value={filters.myCharacter}
              onChange={handleFilterChange}
            >
              <option value="">Tous</option>
              {tekkenCharacters.map((char) => (
                <option key={char} value={char}>
                  {char}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-opponentCharacter">Personnage adverse</label>
            <select
              id="filter-opponentCharacter"
              value={filters.opponentCharacter}
              onChange={handleFilterChange}
            >
              <option value="">Tous</option>
              {tekkenCharacters.map((char) => (
                <option key={char} value={char}>
                  {char}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-opponentName">Nom de l'adversaire</label>
            <input
              type="text"
              id="filter-opponentName"
              value={filters.opponentName}
              onChange={handleFilterChange}
              placeholder="Rechercher par nom..."
            />
          </div>

          <div>
            <label htmlFor="filter-stage">Terrain</label>
            <select
              id="filter-stage"
              value={filters.stage}
              onChange={handleFilterChange}
            >
              <option value="">Tous</option>
              {tekkenStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-opponentRank">Rang adverse</label>
            <select
              id="filter-opponentRank"
              value={filters.opponentRank}
              onChange={handleFilterChange}
            >
              <option value="">Tous</option>
              {tekkenRanks.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3 className="stat-title">Win Rate</h3>
          <div className="stat-value">{winRate}%</div>
        </div>

        <div className="stat-card">
          <h3 className="stat-title">Total des matchs</h3>
          <div className="stat-value">{filteredMatches.length}</div>
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

      {/* Streaks */}
      <div className="streaks-container">
        <div className="streak-card">
          <h3 className="streak-title">Win Streak actuel</h3>
          <div className="streak-value win-streak">
            {streaks.currentWinStreak > 0 ? streaks.currentWinStreak : "-"}
          </div>
        </div>

        <div className="streak-card">
          <h3 className="streak-title">Lose Streak actuel</h3>
          <div className="streak-value lose-streak">
            {streaks.currentLoseStreak > 0 ? streaks.currentLoseStreak : "-"}
          </div>
        </div>

        <div className="streak-card">
          <h3 className="streak-title">Longest Win Streak</h3>
          <div className="streak-value win-streak">{streaks.maxWinStreak}</div>
        </div>

        <div className="streak-card">
          <h3 className="streak-title">Longest Lose Streak</h3>
          <div className="streak-value lose-streak">
            {streaks.maxLoseStreak}
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap matches={filteredMatches} />

      {/* Graphiques */}
      <div className="charts-grid">
        {/* Win Rate Trend */}
        <div className="card">
          <h2>Tendance Win Rate (10 derniers matchs)</h2>
          <div className="chart-container">
            {winRateTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={winRateTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="date" stroke="#cbd5e0" />
                  <YAxis domain={[0, 100]} stroke="#cbd5e0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #800000",
                    }}
                    labelStyle={{ color: "#edf2f7" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="winRate"
                    stroke="#ff3333"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                Pas assez de données pour afficher la tendance
              </div>
            )}
          </div>
        </div>

        {/* Matchup Stats */}
        <div className="card">
          <h2>Stats par matchup</h2>
          <div className="chart-container">
            {characterStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={characterStats.slice(0, 7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="name" stroke="#cbd5e0" />
                  <YAxis domain={[0, 100]} stroke="#cbd5e0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #800000",
                    }}
                    labelStyle={{ color: "#edf2f7" }}
                  />
                  <Legend />
                  <Bar dataKey="winRate" name="Win Rate %" fill="#ff3333" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                Pas assez de données pour afficher les matchups
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stage Stats */}
      <div className="card chart-card">
        <h2>Stats par terrain</h2>
        <div className="chart-container">
          {stageStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageStats.slice(0, 7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="name" stroke="#cbd5e0" />
                <YAxis domain={[0, 100]} stroke="#cbd5e0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #800000",
                  }}
                  labelStyle={{ color: "#edf2f7" }}
                />
                <Legend />
                <Bar dataKey="winRate" name="Win Rate %" fill="#3377ff" />
                <Bar dataKey="matches" name="Nombre de matchs" fill="#33aa33" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">
              Pas assez de données pour afficher les terrains
            </div>
          )}
        </div>
      </div>

      {/* Opponent Rank Stats */}
      <div className="card chart-card">
        <h2>Performance par rangs adverses</h2>
        <div className="chart-container">
          {opponentRankStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={opponentRankStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="name" stroke="#cbd5e0" />
                <YAxis domain={[0, 100]} stroke="#cbd5e0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #800000",
                  }}
                  labelStyle={{ color: "#edf2f7" }}
                />
                <Legend />
                <Bar dataKey="winRate" name="Win Rate %" fill="#ff8c00" />
                <Bar dataKey="matches" name="Nombre de matchs" fill="#33aa33" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">
              Pas assez de données pour afficher les rangs
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
