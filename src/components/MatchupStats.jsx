import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import RankBadge from "./RankBadge";
import { matchTime } from "../services/matchIdentity";

const DERNIERS_MATCHS = 5;

const points = (match) => Number(match.pointsEarned) || 0;

const formatPoints = (value) => (value > 0 ? `+${value}` : `${value}`);

// Win rate contre chaque personnage adverse, et détail d'un matchup choisi.
// Les personnages viennent des matchs eux-mêmes, pas de la liste statique :
// un perso absent de tekkenData.json (Kunimitsu, Fahkumram...) apparaît quand même.
export default function MatchupStats({ matches }) {
  const [opponent, setOpponent] = useState("");

  const matchups = useMemo(() => {
    const byCharacter = new Map();
    matches.forEach((match) => {
      if (!match.opponentCharacter) return;
      const entry = byCharacter.get(match.opponentCharacter) || {
        name: match.opponentCharacter,
        matches: 0,
        wins: 0,
      };
      entry.matches++;
      if (match.result === "win") entry.wins++;
      byCharacter.set(match.opponentCharacter, entry);
    });
    return [...byCharacter.values()]
      .map((entry) => ({
        ...entry,
        winRate: Math.round((entry.wins / entry.matches) * 100),
      }))
      .sort((a, b) => b.matches - a.matches);
  }, [matches]);

  const detail = useMemo(() => {
    if (!opponent) return null;
    const played = matches
      .filter((match) => match.opponentCharacter === opponent)
      .sort((a, b) => matchTime(b) - matchTime(a));
    if (played.length === 0) return null;

    const wins = played.filter((match) => match.result === "win").length;
    return {
      total: played.length,
      wins,
      losses: played.length - wins,
      winRate: Math.round((wins / played.length) * 100),
      points: played.reduce((sum, match) => sum + points(match), 0),
      recent: played.slice(0, DERNIERS_MATCHS),
    };
  }, [matches, opponent]);

  if (matchups.length === 0) {
    return (
      <div className="card">
        <h2>Stats par matchup</h2>
        <div className="empty-chart">
          Pas assez de données pour afficher les matchups
        </div>
      </div>
    );
  }

  return (
    <div className="card matchup-card">
      <div className="matchup-header">
        <h2>Stats par matchup</h2>
        <label className="matchup-select">
          Personnage adverse
          <select
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
          >
            <option value="">Tous</option>
            {[...matchups]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(({ name, matches: count }) => (
                <option key={name} value={name}>
                  {name} ({count})
                </option>
              ))}
          </select>
        </label>
      </div>

      <div className="matchup-chart">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={matchups}
            margin={{ bottom: 40 }}
            // Un clic sur une barre ouvre le détail du personnage
            onClick={(state) =>
              state?.activeLabel && setOpponent(state.activeLabel)
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis
              dataKey="name"
              stroke="#cbd5e0"
              interval={0}
              angle={-40}
              textAnchor="end"
              height={60}
            />
            <YAxis domain={[0, 100]} stroke="#cbd5e0" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #800000",
              }}
              labelStyle={{ color: "#edf2f7" }}
              formatter={(value, name, { payload }) =>
                name === "Win Rate %"
                  ? [`${value}% (${payload.matches} matchs)`, name]
                  : [value, name]
              }
            />
            <Legend verticalAlign="top" />
            <Bar dataKey="winRate" name="Win Rate %" fill="#ff3333" cursor="pointer">
              {matchups.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={
                    !opponent || entry.name === opponent ? "#ff3333" : "#5a2020"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {detail && (
        <div className="matchup-detail">
          <h3>Contre {opponent}</h3>
          <div className="matchup-tiles">
            <div className="matchup-tile">
              <span className="matchup-tile-label">Matchs</span>
              <span className="matchup-tile-value">{detail.total}</span>
            </div>
            <div className="matchup-tile">
              <span className="matchup-tile-label">Victoires / Défaites</span>
              <span className="matchup-tile-value">
                {detail.wins} / {detail.losses}
              </span>
            </div>
            <div className="matchup-tile">
              <span className="matchup-tile-label">Win rate</span>
              <span className="matchup-tile-value">{detail.winRate}%</span>
            </div>
            <div className="matchup-tile">
              <span className="matchup-tile-label">Bilan de points</span>
              <span
                className={`matchup-tile-value ${
                  detail.points >= 0 ? "points-gain" : "points-loss"
                }`}
              >
                {formatPoints(detail.points)}
              </span>
            </div>
          </div>

          <h4>{DERNIERS_MATCHS} derniers matchs</h4>
          <table className="matchup-recent">
            <tbody>
              {detail.recent.map((match) => (
                <tr key={match.id}>
                  <td>{match.date}</td>
                  <td>
                    <span
                      className={
                        match.result === "win" ? "win-badge" : "loss-badge"
                      }
                    >
                      {match.result === "win" ? "Victoire" : "Défaite"}
                    </span>
                  </td>
                  <td>{match.score}</td>
                  <td>{match.opponentName}</td>
                  <td>
                    <RankBadge rank={match.opponentRank} />
                  </td>
                  <td
                    className={points(match) >= 0 ? "points-gain" : "points-loss"}
                  >
                    {points(match) ? formatPoints(points(match)) : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
