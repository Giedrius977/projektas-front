import React, { useEffect, useState } from "react";

function ClientDashboard({ clientId }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);

        // Pakeisk URL pagal savo backend adresą ir parametru filtravimą
        const response = await fetch(`/api/projects?clientId=${clientId}`);

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

    if (clientId) {
      fetchProjects();
    }
  }, [clientId]);

  if (!clientId) {
    return <p>Prašome prisijungti, kad galėtumėte matyti savo projektus.</p>;
  }

  if (loading) return <p>Kraunama projektų informacija...</p>;
  if (error) return <p>Klaida: {error}</p>;

  if (projects.length === 0) return <p>Projektų dar nėra.</p>;

  return (
    <div className="client-dashboard">
      <h2>Jūsų projektai</h2>
      <table>
        <thead>
          <tr>
            <th>Projekto pavadinimas</th>
            <th>Statusas</th>
            <th>Sukūrimo data</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>{project.name}</td>
              <td>{project.status}</td>
              <td>{new Date(project.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientDashboard;
