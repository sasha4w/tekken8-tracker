import React, { useState } from "react";

export default function HistoryTab({
  filters,
  handleFilterChange,
  filteredMatches,
  deleteMatch,
  tekkenCharacters,
  tekkenStages,
  tekkenRanks,
  editMatch,
}) {
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [hoveredRowId, setHoveredRowId] = useState(null);

  const toggleMatchSelection = (matchId) => {
    setSelectedMatches(
      selectedMatches.includes(matchId)
        ? selectedMatches.filter((id) => id !== matchId)
        : [...selectedMatches, matchId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedMatches(
      selectedMatches.length === filteredMatches.length
        ? []
        : filteredMatches.map((match) => match.id)
    );
  };

  const deleteSelectedMatches = () => {
    if (selectedMatches.length === 0) return;

    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer ${selectedMatches.length} match(s) ?`
      )
    ) {
      selectedMatches.forEach((id) => deleteMatch(id, false));
      setSelectedMatches([]);
    }
  };

  return (
    <div className="history-card">
      <div className="card-header">
        <h2>Historique des matchs</h2>
        <div className="match-count-badge">
          {filteredMatches.length} match
          {filteredMatches.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Zone de filtres avec design amélioré */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="filter-column">
            <div className="filter-item">
              <label htmlFor="filter-myCharacter">
                <span className="filter-icon">👤</span> Mon personnage
              </label>
              <select
                id="filter-myCharacter"
                value={filters.myCharacter}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Tous</option>
                {tekkenCharacters.map((char) => (
                  <option key={char} value={char}>
                    {char}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="filter-opponentCharacter">
                <span className="filter-icon">👥</span> Personnage adverse
              </label>
              <select
                id="filter-opponentCharacter"
                value={filters.opponentCharacter}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Tous</option>
                {tekkenCharacters.map((char) => (
                  <option key={char} value={char}>
                    {char}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-column">
            <div className="filter-item">
              <label htmlFor="filter-opponentName">
                <span className="filter-icon">🏷️</span> Nom de l'adversaire
              </label>
              <input
                type="text"
                id="filter-opponentName"
                value={filters.opponentName}
                onChange={handleFilterChange}
                placeholder="Rechercher par nom..."
                className="filter-input"
              />
            </div>

            <div className="filter-item">
              <label htmlFor="filter-stage">
                <span className="filter-icon">🏟️</span> Terrain
              </label>
              <select
                id="filter-stage"
                value={filters.stage}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Tous</option>
                {tekkenStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-column">
            <div className="filter-item">
              <label htmlFor="filter-opponentRank">
                <span className="filter-icon">🏆</span> Rang adverse
              </label>
              <select
                id="filter-opponentRank"
                value={filters.opponentRank}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Tous</option>
                {tekkenRanks.map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="filter-result">
                <span className="filter-icon">🎯</span> Résultat
              </label>
              <select
                id="filter-result"
                value={filters.result || ""}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Tous</option>
                <option value="win">Victoires</option>
                <option value="loss">Défaites</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Actions en masse */}
      {filteredMatches.length > 0 && (
        <div className="bulk-actions">
          <div className="select-all-container">
            <input
              type="checkbox"
              id="select-all"
              checked={
                selectedMatches.length === filteredMatches.length &&
                filteredMatches.length > 0
              }
              onChange={toggleSelectAll}
              className="checkbox"
            />
            <label htmlFor="select-all">Tout sélectionner</label>
          </div>

          {selectedMatches.length > 0 && (
            <button
              onClick={deleteSelectedMatches}
              className="delete-multiple-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="delete-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Supprimer ({selectedMatches.length})
            </button>
          )}
        </div>
      )}

      {/* Table avec design amélioré */}
      <div className="table-container">
        {filteredMatches.length > 0 ? (
          <table className="match-history-table">
            <thead>
              <tr className="table-header">
                <th className="table-cell cell-checkbox"></th>
                <th className="table-cell">Date</th>
                <th className="table-cell">Résultat</th>
                <th className="table-cell">Score</th>
                <th className="table-cell">Mon personnage</th>
                <th className="table-cell">Mon rang</th>
                <th className="table-cell">Perso adverse</th>
                <th className="table-cell">Rang adverse</th>
                <th className="table-cell">Terrain</th>
                <th className="table-cell">Adversaire</th>
                <th className="table-cell">Difficulté</th>
                <th className="table-cell">Notes</th>
                <th className="table-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches
                .slice()
                .reverse()
                .map((match) => (
                  <tr
                    key={match.id}
                    className={`table-row ${
                      match.result === "win" ? "win-row" : "loss-row"
                    }`}
                    onMouseEnter={() => setHoveredRowId(match.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                  >
                    <td className="table-cell cell-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedMatches.includes(match.id)}
                        onChange={() => toggleMatchSelection(match.id)}
                        className="checkbox"
                      />
                    </td>
                    <td className="table-cell">{match.date}</td>
                    <td className="table-cell">
                      <span
                        className={
                          match.result === "win" ? "win-badge" : "loss-badge"
                        }
                      >
                        {match.result === "win" ? "Victoire" : "Défaite"}
                      </span>
                    </td>
                    <td className="table-cell table-cell-center">
                      {match.score}
                    </td>
                    <td className="table-cell">
                      <div className="char-container">
                        <span className="char-name">{match.myCharacter}</span>
                      </div>
                    </td>
                    <td className="table-cell table-cell-center">
                      {match.myRank || "-"}
                    </td>
                    <td className="table-cell">
                      <div className="char-container">
                        <span className="char-name">
                          {match.opponentCharacter}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell table-cell-center">
                      {match.opponentRank || "-"}
                    </td>
                    <td className="table-cell">{match.stage || "-"}</td>
                    <td className="table-cell">{match.opponentName || "-"}</td>
                    <td className="table-cell table-cell-center">
                      <div
                        className={`difficulty-badge difficulty-${
                          match.difficulty || 0
                        }`}
                      >
                        {match.difficulty || "-"}
                      </div>
                    </td>
                    <td className="table-cell notes-cell">
                      {match.notes ? (
                        <div className="notes-tooltip" title={match.notes}>
                          <span className="notes-preview">
                            {match.notes.length > 25
                              ? match.notes.substring(0, 25) + "..."
                              : match.notes}
                          </span>
                          {match.notes.length > 25 && (
                            <div className="tooltip-content">{match.notes}</div>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="table-cell action-cell">
                      <div className="action-buttons">
                        <button
                          onClick={() => editMatch(match.id)}
                          className="edit-button"
                          title="Modifier"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="action-icon"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteMatch(match.id)}
                          className="delete-button"
                          title="Supprimer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="action-icon"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p>Aucun match trouvé avec les filtres actuels</p>
            <button
              className="reset-filters-button"
              onClick={() => {
                // Ajouter la logique pour réinitialiser les filtres
                handleFilterChange({
                  target: { id: "reset-filters", value: "" },
                });
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
