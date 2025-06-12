import React, { useEffect, useState } from "react";

function ClientDashboard({ username, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      const userResponse = await fetch(
        `http://localhost:8083/api/users/by-username/${username}`
      );

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await userResponse.json();
      setUserInfo(userData);

      const projectsResponse = await fetch(
        `http://localhost:8083/api/users/${userData.id}/projects?includeContactInfo=true`
      );

      if (!projectsResponse.ok) {
        throw new Error("Failed to fetch projects");
      }

      const projectsData = await projectsResponse.json();
      console.log("Received projects:", projectsData); // 🧪 <- pridėta eilutė

      setProjects(projectsData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (username) {
    fetchData();
  }
}, [username]);


  const formatDate = (dateString) => {
    if (!dateString) return "Nenustatyta";
    try {
      return new Date(dateString).toLocaleDateString('lt-LT');
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price) => {
    if (!price) return "Nenustatyta";
    return `${price} €`;
  };

  return (
    <div className="client-dashboard" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Mano užsakymai</h2>
        <button 
          onClick={onLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Atsijungti
        </button>
      </div>

      {userInfo && (
        <div style={{ marginBottom: "20px" }}>
          <p><strong>Vartotojas:</strong> {userInfo.name || username}</p>
          <p><strong>El. paštas:</strong> {userInfo.email || "Nenurodytas"}</p>
          <p><strong>Telefonas:</strong> {userInfo.phone || "Nenurodytas"}</p>
        </div>
      )}

      {loading && <p>Kraunama...</p>}
      {error && <p style={{ color: "red" }}>Klaida: {error}</p>}

      {!loading && projects.length === 0 && !error && (
        <p>Šiuo metu neturite jokių užsakymų.</p>
      )}

      {projects.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            <thead style={{ backgroundColor: "#007ACC", color: "white" }}>
              <tr>
                <th style={{ padding: "12px", textAlign: "left" }}>Užsakymo nr.</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Aprašymas</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Būsena</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Užsakyta</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Pristatymo data</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Užsakymo kaina</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Pastabos</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.contactRequest?.id || project.id}>
  <td style={{ padding: "12px", fontWeight: "bold" }}>
    #{project.contactRequest?.id || "Nežinomas"}
  </td>
                  <td style={{ padding: "12px" }}>{project.description || "Nenurodyta"}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor: 
                        project.status === "Užbaigta" ? "#4CAF50" :
                        project.status === "Atšaukta" ? "#f44336" :
                        "#FFC107",
                      color: "#000",
                      fontSize: "0.9em"
                    }}>
                      {project.status || "Nenustatyta"}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>{formatDate(project.createdAt)}</td>
                  <td style={{ padding: "12px" }}>{formatDate(project.deliveryDate)}</td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>{formatPrice(project.orderPrice)}</td>
                  <td style={{ padding: "12px", fontStyle: project.notes ? "normal" : "italic" }}>
                    {project.notes || "Nėra pastabų"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ClientDashboard;
