import React from "react";

export default function FormTab({
  formData,
  handleInputChange,
  handleSubmit,
  tekkenCharacters,
  tekkenRanks,
  tekkenStages,
  getAvailableScores,
}) {
  return (
    <div className="card">
      <h2>Ajouter un match</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Partie 1 */}
          <div>
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label htmlFor="result">Résultat</label>
            <select
              id="result"
              value={formData.result}
              onChange={handleInputChange}
              required
            >
              <option value="win">Victoire</option>
              <option value="loss">Défaite</option>
            </select>
          </div>

          <div>
            <label htmlFor="score">Score (Vous - Adversaire)</label>
            <select
              id="score"
              value={formData.score}
              onChange={handleInputChange}
              required
            >
              {getAvailableScores().map((scoreOption) => (
                <option key={scoreOption.value} value={scoreOption.value}>
                  {scoreOption.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="difficulty">Difficulté (1-5)</label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              required
            >
              <option value="1">1 - Très facile</option>
              <option value="2">2 - Facile</option>
              <option value="3">3 - Moyen</option>
              <option value="4">4 - Difficile</option>
              <option value="5">5 - Très difficile</option>
            </select>
          </div>

          {/* Partie 2 */}
          <div>
            <label htmlFor="myCharacter">Mon personnage</label>
            <select
              id="myCharacter"
              value={formData.myCharacter}
              onChange={handleInputChange}
              required
            >
              <option value="">Sélectionner un personnage</option>
              {tekkenCharacters.map((char) => (
                <option key={char} value={char}>
                  {char}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="myRank">Mon rang</label>
            <select
              id="myRank"
              value={formData.myRank}
              onChange={handleInputChange}
              required
            >
              <option value="">Sélectionner un rang</option>
              {tekkenRanks.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="opponentCharacter">Personnage adversaire</label>
            <select
              id="opponentCharacter"
              value={formData.opponentCharacter}
              onChange={handleInputChange}
              required
            >
              <option value="">Sélectionner un personnage</option>
              {tekkenCharacters.map((char) => (
                <option key={char} value={char}>
                  {char}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="opponentRank">Rang adversaire</label>
            <select
              id="opponentRank"
              value={formData.opponentRank}
              onChange={handleInputChange}
              required
            >
              <option value="">Sélectionner un rang</option>
              {tekkenRanks.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stage">Terrain</label>
            <select
              id="stage"
              value={formData.stage}
              onChange={handleInputChange}
              required
            >
              <option value="">Sélectionner un terrain</option>
              {tekkenStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="opponentName">
              Nom de l'adversaire (optionnel)
            </label>
            <input
              type="text"
              id="opponentName"
              value={formData.opponentName}
              onChange={handleInputChange}
              placeholder="Ex: Player123"
            />
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginTop: "1.5rem" }}>
          <label htmlFor="notes">Notes (optionnel)</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Notez vos observations sur le match..."
          />
        </div>

        {/* Submit */}
        <div style={{ marginTop: "1.5rem" }}>
          <button type="submit">ENREGISTRER LE MATCH</button>
        </div>
      </form>
    </div>
  );
}
