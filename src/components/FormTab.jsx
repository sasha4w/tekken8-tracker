import React from "react";

export default function FormTab({
  formData,
  handleInputChange,
  handleSubmit,
  tekkenCharacters,
  tekkenRanks,
  tekkenStages,
  getAvailableScores,
  userProfile,
}) {
  return (
    <div className="card">
      <h2>Ajouter un match</h2>

      <form onSubmit={handleSubmit}>
        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
            <label htmlFor="score">Score</label>
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
        </div>

        {/* Informations joueur et adversaire */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Section joueur */}
          <div className="card bg-bg-dark p-4 rounded border border-primary-dark">
            <h3 className="text-primary mb-3">Votre côté</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="myCharacter">Mon personnage</label>
                <select
                  id="myCharacter"
                  value={
                    formData.myCharacter || userProfile?.mainCharacter || ""
                  }
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
            </div>
          </div>

          {/* Section adversaire */}
          <div className="card bg-bg-dark p-4 rounded border border-primary-dark">
            <h3 className="text-primary mb-3">Côté adversaire</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            <div className="mt-2">
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
        </div>

        {/* Informations complémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

          <div>
            <label htmlFor="pointsEarned">Points Tekken gagnés/perdus</label>
            <input
              type="number"
              id="pointsEarned"
              value={formData.pointsEarned || "0"}
              onChange={handleInputChange}
              placeholder="Ex: +120 ou -80"
            />
            <small className="text-text-muted">
              Valeur positive pour les gains, négative pour les pertes
            </small>
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
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label htmlFor="notes">Notes (optionnel)</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Notez vos observations sur le match..."
            style={{ minHeight: "80px" }}
          />
        </div>

        {/* Submit */}
        <div>
          <button type="submit">ENREGISTRER LE MATCH</button>
        </div>
      </form>
    </div>
  );
}
