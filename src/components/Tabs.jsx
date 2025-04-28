// components/Tabs.jsx
export default function Tabs({ activeTab, setActiveTab }) {
  return (
    <div className="container">
      <div className="tabs">
        <button
          className={`tab-button ${
            activeTab === "profile" ? "active" : "inactive"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          Mon Profil
        </button>
        <button
          className={`tab-button ${
            activeTab === "form" ? "active" : "inactive"
          }`}
          onClick={() => setActiveTab("form")}
        >
          Ajouter un match
        </button>
        <button
          className={`tab-button ${
            activeTab === "stats" ? "active" : "inactive"
          }`}
          onClick={() => setActiveTab("stats")}
        >
          Statistiques
        </button>
        <button
          className={`tab-button ${
            activeTab === "history" ? "active" : "inactive"
          }`}
          onClick={() => setActiveTab("history")}
        >
          Historique
        </button>
        <button
          className={`tab-button ${
            activeTab === "replays" ? "active" : "inactive"
          }`}
          onClick={() => setActiveTab("replays")}
        >
          Replays
        </button>
      </div>
    </div>
  );
}
