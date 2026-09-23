import React, { useState, useEffect } from "react";
import { battleTypeLabel, DEFAULT_BATTLE_TYPE } from "../services/ewgfApi";

const PAR_PAGE = 50;

// L'identifiant porte l'horodatage exact (tk-<secondes>-<adversaire>), plus
// précis que la date du match, qui ne descend pas sous la journée.
const matchTime = (match) => {
  const parsed = String(match.id).match(/^tk-(\d+)-/);
  return parsed ? Number(parsed[1]) : Date.parse(match.date) / 1000 || 0;
};

const formatPoints = (points) => {
  const value = Number(points);
  if (!value) return "";
  return value > 0 ? `+${value}` : `${value}`;
};

const pointsClass = (points) =>
  Number(points) > 0 ? "points-gain" : Number(points) < 0 ? "points-loss" : "";

export default function HistoryTab({
  filters,
  handleFilterChange,
  filteredMatches,
  battleTypes,
  resetFilters,
  tekkenCharacters,
  tekkenStages,
  tekkenRanks,
}) {
  const [page, setPage] = useState(1);

  const sortedMatches = [...filteredMatches].sort(
    (a, b) => matchTime(b) - matchTime(a)
  );
  const pageCount = Math.max(1, Math.ceil(sortedMatches.length / PAR_PAGE));
  const matchesOnPage = sortedMatches.slice(
    (page - 1) * PAR_PAGE,
    page * PAR_PAGE
  );

  // Changer un filtre réduit la liste : rester page 7 afficherait du vide.
  useEffect(() => {
    setPage(1);
  }, [filters]);

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

            <div className="filter-item">
              <label htmlFor="filter-battleType">
                <span className="filter-icon">⚔️</span> Type de match
              </label>
              <select
                id="filter-battleType"
                value={filters.battleType}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Tous</option>
                {battleTypes.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table avec design amélioré */}
      <div className="table-container">
        {filteredMatches.length > 0 ? (
          <table className="match-history-table">
            <thead>
              <tr className="table-header">
                <th className="table-cell">Date</th>
                <th className="table-cell">Type</th>
                <th className="table-cell">Résultat</th>
                <th className="table-cell">Score</th>
                <th className="table-cell">Mon perso</th>
                <th className="table-cell">Mon rang</th>
                <th className="table-cell">Perso adv.</th>
                <th className="table-cell">Rang adv.</th>
                <th className="table-cell">Terrain</th>
                <th className="table-cell">Adversaire</th>
                <th className="table-cell">Points</th>
              </tr>
            </thead>
            <tbody>
              {matchesOnPage.map((match) => (
                  <tr
                    key={match.id}
                    className={`table-row ${
                      match.result === "win" ? "win-row" : "loss-row"
                    }`}
                  >
                    <td className="table-cell">{match.date}</td>
                    <td className="table-cell table-cell-center">
                      <span className="battle-type-badge">
                        {battleTypeLabel(match.battleType || DEFAULT_BATTLE_TYPE)}
                      </span>
                    </td>
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
                      {match.myRank}
                    </td>
                    <td className="table-cell">
                      <div className="char-container">
                        <span className="char-name">
                          {match.opponentCharacter}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell table-cell-center">
                      {match.opponentRank}
                    </td>
                    <td className="table-cell">{match.stage}</td>
                    <td className="table-cell">{match.opponentName}</td>
                    <td className="table-cell table-cell-center">
                      <span className={pointsClass(match.pointsEarned)}>
                        {formatPoints(match.pointsEarned)}
                      </span>
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
              onClick={resetFilters}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {pageCount > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
          >
            Précédent
          </button>
          <span className="pagination-status">
            Page {page} sur {pageCount}
          </span>
          <button
            className="pagination-button"
            onClick={() =>
              setPage((current) => Math.min(pageCount, current + 1))
            }
            disabled={page === pageCount}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
