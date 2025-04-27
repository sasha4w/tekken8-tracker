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
  return (
    <div>
      {/* Filtres */}
      <div className="card">
        <h2>Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-4">
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
      <div className="grid grid-cols-1 md:grid-cols-4">
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

      {/* Graphiques */}
      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ marginTop: "1.5rem" }}
      >
        {/* Win Rate Trend */}
        <div className="card">
          <h2>Tendance Win Rate (10 derniers matchs)</h2>
          <div className="chart-container">
            {winRateTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={winRateTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="match" stroke="#cbd5e0" />
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
      <div className="card" style={{ marginTop: "1.5rem" }}>
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
      <div className="card" style={{ marginTop: "1.5rem" }}>
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
