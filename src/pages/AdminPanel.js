import React, { useState, useEffect } from "react";
import "../styles/AdminPanel.css";

const statusOptions = [
  "Nevertinta",
  "Vertinama",
  "Projektuojama",
  "Komercinis pasiūlymas",
  "Laukiama patvirtinimo",
  "Gaminama",
  "Paruošta pristatymui",
  "Pristatoma / Montuojama",
  "Užbaigta",
];

const AdminPanel = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedMessageIds, setExpandedMessageIds] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8083/api/contact-requests")
      .then((res) => {
        if (!res.ok) throw new Error("Klaida gaunant užklausas");
        return res.json();
      })
      .then((data) => {
        // Pridedam status ir convertedToProject, jei nėra
        const initialized = data.map((item) => ({
          ...item,
          status: item.status || "Nevertinta",
          convertedToProject: item.convertedToProject || false,
        }));
        setRequests(initialized);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toISOString().slice(0, 10);
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:8083/api/contact-requests/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Nepavyko ištrinti užklausos");
        setRequests((prev) => prev.filter((req) => req.id !== id));
      })
      .catch((err) => alert(err.message));
  };

  const handleStatusChange = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );

    fetch(`http://localhost:8083/api/contact-requests/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Nepavyko išsaugoti būsenos");
      })
      .catch((err) => {
        alert("Klaida saugant būseną: " + err.message);
      });
  };

  const toggleMessage = (id) => {
    setExpandedMessageIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Konvertavimo funkcija: userId imamas toks pat kaip contact request id
  const convertToProject = (id) => {
    const userId = id; // Pakeista, kad siųstų contact-request id kaip userId

    fetch(`http://localhost:8083/api/contact-requests/convert/${id}?userId=${userId}`, {
      method: "POST",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Nepavyko konvertuoti į projektą");
        return res.json();
      })
      .then((project) => {
        alert(`Užklausa paversta projektu #${project.id}`);
        // Pažymim užklausą kaip konvertuotą
        setRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, convertedToProject: true } : req
          )
        );
      })
      .catch((err) => alert(err.message));
  };

  const truncateLength = 100;

  return (
    <div className="admin-panel" style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Užklausos</h2>

      {loading && <p>Kraunasi...</p>}
      {error && <p className="error">Klaida: {error}</p>}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          tableLayout: "fixed",
        }}
      >
        <thead style={{ backgroundColor: "#007ACC", color: "white" }}>
          <tr>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "50px" }}>
              Data
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "60px" }}>
              Vardas
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "70px" }}>
              Telefonas
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "80px" }}>
              El. paštas
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "190px" }}>
              Žinutė
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "40px" }}>
              Failas
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "60px" }}>
              Būsena
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "100px" }}>
              Veiksmai
            </th>
          </tr>
        </thead>

        <tbody>
          {requests.map((request) => {
            const isExpanded = expandedMessageIds.has(request.id);
            const message = request.message || "";
            const shortMessage =
              message.length > truncateLength
                ? message.slice(0, truncateLength) + "..."
                : message;

            return (
              <tr key={request.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px", whiteSpace: "nowrap" }}>
                  {formatDate(request.createdAt)}
                </td>
                <td style={{ padding: "10px" }}>{request.name}</td>
                <td style={{ padding: "10px" }}>{request.phone}</td>
                <td style={{ padding: "10px" }}>{request.email}</td>
                <td style={{ padding: "10px" }}>
                  {isExpanded ? message : shortMessage}
                  {message.length > truncateLength && (
                    <button
                      onClick={() => toggleMessage(request.id)}
                      style={{
                        marginLeft: "10px",
                        background: "none",
                        border: "none",
                        color: "#007ACC",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                        fontSize: "0.9em",
                      }}
                    >
                      {isExpanded ? "Rodyti mažiau" : "Rodyti daugiau"}
                    </button>
                  )}
                </td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  {request.file ? (
                    <a
                      href={request.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#007ACC",
                        textDecoration: "underline",
                        fontWeight: "bold",
                        fontSize: "0.9em",
                      }}
                    >
                      Peržiūrėti
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td style={{ padding: "10px" }}>
                  <select
                    value={request.status}
                    onChange={(e) =>
                      handleStatusChange(request.id, e.target.value)
                    }
                    style={{ padding: "4px", fontSize: "0.9em", width: "100%" }}
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  <button
                    onClick={() => handleDelete(request.id)}
                    style={{
                      backgroundColor: "#d9534f",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "5px 10px",
                      cursor: "pointer",
                      marginBottom: "5px",
                      width: "100%",
                    }}
                  >
                    Ištrinti
                  </button>
                  <button
                    onClick={() => convertToProject(request.id)}
                    disabled={request.convertedToProject}
                    style={{
                      backgroundColor: request.convertedToProject
                        ? "#6c757d"
                        : "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "5px 10px",
                      cursor: request.convertedToProject ? "default" : "pointer",
                      width: "100%",
                    }}
                  >
                    {request.convertedToProject
                      ? "Jau paversta projektu"
                      : "Konvertuoti į projektą"}
                  </button>
                </td>
              </tr>
            );
          })}
          {requests.length === 0 && !loading && (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                Užklausų nėra
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
