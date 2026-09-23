import React from "react";
import { RefreshCw } from "lucide-react";
import ProfileSection from "./ProfileSection";

// Décrit l'état de la dernière synchronisation avec ewgf.gg et Wavu Wank.
function SyncBanner({ tekkenId, syncState, onRefresh }) {
  const { loading, errors = [], lastSyncAt, added, enriched } = syncState;

  const message = () => {
    if (!tekkenId)
      return "Renseigne ton Tekken ID ci-dessous pour importer tes matchs.";
    if (loading) return "Chargement de tes matchs...";
    if (!lastSyncAt) return errors.join(" ") || "Pas encore synchronisé.";

    const bilan = [];
    if (added > 0) bilan.push(`${added} nouveau(x) match(es)`);
    if (enriched > 0) bilan.push(`${enriched} complété(s)`);
    if (bilan.length === 0) bilan.push("Aucun nouveau match");

    const heure = new Date(lastSyncAt).toLocaleTimeString();
    return [bilan.join(", "), ...errors, `dernière synchro à ${heure}`].join(
      " — "
    );
  };

  return (
    <div className={`sync-banner${errors.length ? " sync-banner-error" : ""}`}>
      <span>{message()}</span>
      <button
        type="button"
        className="sync-refresh-button"
        onClick={onRefresh}
        disabled={loading || !tekkenId}
      >
        <RefreshCw className={loading ? "animate-spin" : ""} size={16} />
        Actualiser
      </button>
    </div>
  );
}

export default function ProfileTab({
  userProfile,
  profileForm,
  handleProfileInputChange,
  handleProfileSubmit,
  tekkenCharacters,
  tekkenRanks,
  winRate,
  matches,
  mostPlayed,
  avgOpponentRank,
  rankProgressionData,
  playerTitles,
  updateUserProfile,
  syncState,
  onRefresh,
}) {
  return (
    <div>
      <SyncBanner
        tekkenId={userProfile.tekkenId}
        syncState={syncState}
        onRefresh={onRefresh}
      />

      <ProfileSection
        userProfile={userProfile}
        rankProgressionData={rankProgressionData}
        tekkenRanks={tekkenRanks}
        winRate={winRate}
        matches={matches}
        mostPlayed={mostPlayed}
        avgOpponentRank={avgOpponentRank}
        playerTitles={playerTitles}
        updateUserProfile={updateUserProfile}
      />

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h2>Modifier mon profil</h2>
        <form onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div>
              <label htmlFor="username">Pseudo</label>
              <input
                type="text"
                id="username"
                value={profileForm.username}
                onChange={handleProfileInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="tekkenId">Tekken ID</label>
              <input
                type="text"
                id="tekkenId"
                value={profileForm.tekkenId}
                onChange={handleProfileInputChange}
                placeholder="ex : 5dgF8GbjAQjj"
              />
              <small>Sert à importer tes matchs depuis ewgf.gg</small>
            </div>
            <div>
              <label htmlFor="mainCharacter">Personnage principal</label>
              <select
                id="mainCharacter"
                value={profileForm.mainCharacter}
                onChange={handleProfileInputChange}
                required
              >
                <option value="">Sélectionner</option>
                {tekkenCharacters.map((char) => (
                  <option key={char} value={char}>
                    {char}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="currentRank">Rang actuel</label>
              <select
                id="currentRank"
                value={profileForm.currentRank}
                onChange={handleProfileInputChange}
                required
              >
                <option value="">Sélectionner</option>
                {tekkenRanks.map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <button type="submit">METTRE À JOUR LE PROFIL</button>
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h2>Historique des rangs</h2>
        <div style={{ overflowX: "auto" }}>
          {userProfile.rankHistory.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Rang</th>
                </tr>
              </thead>
              <tbody>
                {userProfile.rankHistory
                  .slice()
                  .reverse()
                  .map((entry, idx) => (
                    <tr key={idx}>
                      <td>{entry.date}</td>
                      <td>{entry.rank}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">Aucun historique</div>
          )}
        </div>
      </div>
    </div>
  );
}
