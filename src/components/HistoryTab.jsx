import React from "react";

export default function HistoryTab({
  filters,
  handleFilterChange,
  filteredMatches,
  deleteMatch,
  tekkenCharacters,
  tekkenStages,
  tekkenRanks,
}) {
  return (
    <div className="card">
      <h2>Historique des matchs</h2>

      {/* Filtres */}
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

      {/* Table Matchs */}
      <div style={{ marginTop: "1.5rem", overflowX: "auto" }}>
        {filteredMatches.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Résultat</th>
                <th>Score</th>
                <th>Mon perso</th>
                <th>Mon rang</th>
                <th>Perso adverse</th>
                <th>Rang adverse</th>
                <th>Terrain</th>
                <th>Adversaire</th>
                <th>Difficulté</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches
                .slice()
                .reverse()
                .map((match) => (
                  <tr
                    key={match.id}
                    className={match.result === "win" ? "win-row" : "loss-row"}
                  >
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
                    <td>{match.myCharacter}</td>
                    <td>{match.myRank || "-"}</td>
                    <td>{match.opponentCharacter}</td>
                    <td>{match.opponentRank || "-"}</td>
                    <td>{match.stage || "-"}</td>
                    <td>{match.opponentName || "-"}</td>
                    <td>{match.difficulty}</td>
                    <td className="truncate">
                      {match.notes ? (
                        <span title={match.notes}>
                          {match.notes.length > 30
                            ? match.notes.substring(0, 30) + "..."
                            : match.notes}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => deleteMatch(match.id)}
                        className="delete-button"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            Aucun match trouvé avec les filtres actuels
          </div>
        )}
      </div>
    </div>
  );
}
