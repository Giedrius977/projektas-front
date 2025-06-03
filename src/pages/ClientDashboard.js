import React, { useEffect, useState } from "react";

function ClientDashboard({ username, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);

        // Tarkim, backend laukia username kaip filtro parametras
        const response = await fetch(`/api/projects?client=${username}`);

        if (!response.ok) {
          throw new Error("Nepavyko gauti projektų");
        }

        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err.message || "Įvyko klaida");
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchProjects();
    }
  }, [username]);

  return (
    <div className="client-dashboard" style={{ padding: "20px" }}>
      <h2>Užsakovo panelė</h2>
      <button onClick={onLogout} style={{ marginBottom: "1rem" }}>
        Atsijungti
      </button>

      {loading && <p>Kraunama...</p>}
      {error && <p style={{ color: "red" }}>Klaida: {error}</p>}

      {!loading && projects.length === 0 && <p>Projektų nėra.</p>}

      {projects.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Projekto pavadinimas</th>
              <th>Statusas</th>
              <th>Sukūrimo data</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.status}</td>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ClientDashboard;
