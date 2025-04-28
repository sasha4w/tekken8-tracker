import React, { useState } from "react";
import { RefreshCw, CheckIcon } from "lucide-react"; // Si vous avez Lucide React

export default function ReplayTab({
  replays,
  loadingReplays,
  fetchReplays,
  importReplaysToHistory,
  characterIdMap,
  rankIdMap,
  stageIdMap,
}) {
  const [selectedReplays, setSelectedReplays] = useState([]);
  const [filterUsername, setFilterUsername] = useState("");

  const handleCheckboxChange = (battleId) => {
    setSelectedReplays((prev) => {
      if (prev.includes(battleId)) {
        return prev.filter((id) => id !== battleId);
      } else {
        return [...prev, battleId];
      }
    });
  };

  const handleImportSelected = () => {
    const replayToImport = replays.filter((replay) =>
      selectedReplays.includes(replay.battle_id)
    );
    importReplaysToHistory(replayToImport);
    setSelectedReplays([]);
  };

  const filteredReplays = replays.filter(
    (replay) =>
      filterUsername === "" ||
      replay.p1_name.toLowerCase().includes(filterUsername.toLowerCase()) ||
      replay.p2_name.toLowerCase().includes(filterUsername.toLowerCase())
  );

  return (
    <div className="replay-tab">
      <h2 className="text-2xl mb-4">Importer des replays depuis Wavu Wank</h2>

      <div className="controls mb-4 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            className="form-control"
            placeholder="Filtrer par nom de joueur"
            value={filterUsername}
            onChange={(e) => setFilterUsername(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => fetchReplays()}
          disabled={loadingReplays}
        >
          {loadingReplays ? (
            <>
              <RefreshCw className="animate-spin mr-2" size={16} />
              Chargement...
            </>
          ) : (
            "Charger les replays"
          )}
        </button>

        <button
          className="btn btn-success"
          onClick={handleImportSelected}
          disabled={selectedReplays.length === 0}
        >
          <CheckIcon size={16} className="mr-2" />
          Importer {selectedReplays.length} match(es)
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => fetchReplays(replaysBefore)}
          disabled={loadingReplays}
        >
          Charger plus anciens
        </button>
      </div>

      {replays.length === 0 && !loadingReplays && (
        <div className="text-center py-8">
          <p>
            Aucun replay chargé. Cliquez sur "Charger les replays" pour
            commencer.
          </p>
        </div>
      )}

      {loadingReplays && (
        <div className="text-center py-8">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p>Chargement des replays...</p>
        </div>
      )}

      {filteredReplays.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table table-striped">
            <thead>
              <tr>
                <th></th>
                <th>Date</th>
                <th>Joueur 1</th>
                <th>Personnage</th>
                <th>Rang</th>
                <th>Score</th>
                <th>Joueur 2</th>
                <th>Personnage</th>
                <th>Rang</th>
                <th>Stage</th>
              </tr>
            </thead>
            <tbody>
              {filteredReplays.map((replay) => {
                const date = new Date(replay.battle_at * 1000);
                const formattedDate = date.toLocaleDateString();
                const formattedTime = date.toLocaleTimeString();

                const p1Character =
                  characterIdMap[replay.p1_chara_id] ||
                  `ID: ${replay.p1_chara_id}`;
                const p2Character =
                  characterIdMap[replay.p2_chara_id] ||
                  `ID: ${replay.p2_chara_id}`;
                const p1Rank =
                  rankIdMap[replay.p1_rank] || `ID: ${replay.p1_rank}`;
                const p2Rank =
                  rankIdMap[replay.p2_rank] || `ID: ${replay.p2_rank}`;
                const stage =
                  stageIdMap[replay.stage_id] || `ID: ${replay.stage_id}`;

                const score = `${replay.p1_rounds}-${replay.p2_rounds}`;

                return (
                  <tr
                    key={replay.battle_id}
                    className={
                      selectedReplays.includes(replay.battle_id)
                        ? "selected-row"
                        : ""
                    }
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedReplays.includes(replay.battle_id)}
                        onChange={() => handleCheckboxChange(replay.battle_id)}
                      />
                    </td>
                    <td>
                      {formattedDate}
                      <br />
                      <small>{formattedTime}</small>
                    </td>
                    <td>{replay.p1_name}</td>
                    <td>{p1Character}</td>
                    <td>{p1Rank}</td>
                    <td className="text-center font-bold">{score}</td>
                    <td>{replay.p2_name}</td>
                    <td>{p2Character}</td>
                    <td>{p2Rank}</td>
                    <td>{stage}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
