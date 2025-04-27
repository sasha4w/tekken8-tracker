import React from "react";
import ProfileSection from "./ProfileSection";

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
}) {
  return (
    <div>
      {/* Partie Profil + Stats générales */}
      <ProfileSection
        userProfile={userProfile}
        rankProgressionData={rankProgressionData}
        tekkenRanks={tekkenRanks}
        winRate={winRate}
        matches={matches}
        mostPlayed={mostPlayed}
        avgOpponentRank={avgOpponentRank}
      />

      {/* Formulaire Modification Profil */}
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

      {/* Historique des Rangs */}
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
