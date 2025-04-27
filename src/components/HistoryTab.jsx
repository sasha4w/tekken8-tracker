import React, { useState } from "react";

export default function HistoryTab({
  filters,
  handleFilterChange,
  filteredMatches,
  deleteMatch,
  tekkenCharacters,
  tekkenStages,
  tekkenRanks,
  editMatch, // Nouvelle prop pour la modification
}) {
  // État pour gérer les cases à cocher
  const [selectedMatches, setSelectedMatches] = useState([]);

  // Fonction pour gérer la sélection/désélection d'un match
  const toggleMatchSelection = (matchId) => {
    if (selectedMatches.includes(matchId)) {
      setSelectedMatches(selectedMatches.filter((id) => id !== matchId));
    } else {
      setSelectedMatches([...selectedMatches, matchId]);
    }
  };

  // Fonction pour sélectionner/désélectionner tous les matchs
  const toggleSelectAll = () => {
    if (selectedMatches.length === filteredMatches.length) {
      setSelectedMatches([]);
    } else {
      setSelectedMatches(filteredMatches.map((match) => match.id));
    }
  };

  // Fonction pour supprimer tous les matchs sélectionnés
  const deleteSelectedMatches = () => {
    if (selectedMatches.length === 0) return;

    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer ${selectedMatches.length} match(s) ?`
      )
    ) {
      selectedMatches.forEach((id) => deleteMatch(id, false)); // false pour éviter la confirmation individuelle
      setSelectedMatches([]);
    }
  };

  // Fonction pour obtenir l'URL de l'avatar du personnage
  //   const getCharacterAvatar = (character) => {
  //     // Ici, vous devriez remplacer ceci par votre logique réelle pour récupérer les avatars
  //     return `/assets/characters/${character
  //       .toLowerCase()
  //       .replace(/\s+/g, "-")}.png`;
  //   };

  return (
    <div className="card">
      <h2>Historique des matchs</h2>

      {/* Filtres */}
      <div className="filter-grid">
        <div className="filter-item">
          <label htmlFor="filter-myCharacter">Mon personnage</label>
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
          <label htmlFor="filter-opponentCharacter">Personnage adverse</label>
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

        <div className="filter-item">
          <label htmlFor="filter-opponentName">Nom de l'adversaire</label>
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
          <label htmlFor="filter-stage">Terrain</label>
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

        <div className="filter-item">
          <label htmlFor="filter-opponentRank">Rang adverse</label>
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
      </div>

      {/* Actions groupées */}
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

      {/* Table Matchs */}
      <div className="table-container">
        {filteredMatches.length > 0 ? (
          <table className="match-history-table">
            <thead>
              <tr className="table-header">
                <th className="table-cell">Select</th>
                <th className="table-cell">Date</th>
                <th className="table-cell">Résultat</th>
                <th className="table-cell">Score</th>
                <th className="table-cell">Mon perso</th>
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
                  >
                    <td className="table-cell">
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
                    <td className="table-cell">{match.score}</td>
                    <td className="table-cell">
                      <div className="char-container">
                        {/* {match.myCharacter && (
                          <img
                            src={getCharacterAvatar(match.myCharacter)}
                            alt={match.myCharacter}
                            className="character-avatar"
                            onError={(e) => {
                              e.target.src = "/assets/characters/default.png";
                              e.target.onerror = null;
                            }}
                          />
                        )} */}
                        <span>{match.myCharacter}</span>
                      </div>
                    </td>
                    <td className="table-cell">{match.myRank || "-"}</td>
                    <td className="table-cell">
                      <div className="char-container">
                        {/* {match.opponentCharacter && (
                          <img
                            src={getCharacterAvatar(match.opponentCharacter)}
                            alt={match.opponentCharacter}
                            className="character-avatar"
                            onError={(e) => {
                              e.target.src = "/assets/characters/default.png";
                              e.target.onerror = null;
                            }}
                          />
                        )} */}
                        <span>{match.opponentCharacter}</span>
                      </div>
                    </td>
                    <td className="table-cell">{match.opponentRank || "-"}</td>
                    <td className="table-cell">{match.stage || "-"}</td>
                    <td className="table-cell">{match.opponentName || "-"}</td>
                    <td className="table-cell">{match.difficulty}</td>
                    <td className="table-cell notes-cell">
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
            Aucun match trouvé avec les filtres actuels
          </div>
        )}
      </div>
    </div>
  );
}
