import React, { useEffect, useState } from "react";
import OrderProgressTracker from "../pages/OrderProgressTracker";

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

        // 1. Gauti vartotojo duomenis
        const userResponse = await fetch(
          `http://localhost:8083/api/users/by-username/${username}`,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        if (!userResponse.ok) {
          throw new Error("Nepavyko gauti vartotojo duomenų");
        }

        const userData = await userResponse.json();
        setUserInfo({
          name: userData.name,
          email: userData.email,
          phone: userData.phone
        });

        // 2. Gauti projektus su parametru, kad sumažinti atsakymo dydį
        const projectsResponse = await fetch(
          `http://localhost:8083/api/users/${userData.id}/projects?simple=true`,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        if (!projectsResponse.ok) {
          throw new Error("Nepavyko gauti projektų sąrašo");
        }

        const projectsData = await projectsResponse.json();
        
        // 3. Transformuoti gautus duomenis
        const simplifiedProjects = projectsData.map(project => ({
          id: project.id,
          description: project.description,
          status: project.status,
          createdAt: project.createdAt,
          deliveryDate: project.deliveryDate,
          orderPrice: project.orderPrice,
          notes: project.notes,
          contactRequestId: project.contactRequest?.id || null
        }));

        setProjects(simplifiedProjects);

      } catch (err) {
        console.error("Klaida:", err);
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

      {loading && <div style={{ textAlign: "center", padding: "20px" }}>Kraunama...</div>}
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
                <tr key={project.id}>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>
                    #{project.contactRequestId || project.id}
                  </td>
                  <td style={{ padding: "12px" }}>{project.description || "Nenurodyta"}</td>
                  <td style={{ padding: "12px" }}><OrderProgressTracker currentStatus={project.status} 
                  editable={false}/>
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