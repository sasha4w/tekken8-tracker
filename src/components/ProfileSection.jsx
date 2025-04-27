// components/ProfileSection.jsx

import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from "recharts";

export default function ProfileSection({
  userProfile,
  rankProgressionData,
  tekkenRanks,
  winRate,
  matches,
  mostPlayed,
  avgOpponentRank,
}) {
  return (
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
  );
}
