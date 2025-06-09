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
  const [editingField, setEditingField] = useState({ id: null, field: null });

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8083/api/contact-requests")
      .then((res) => {
        if (!res.ok) throw new Error("Klaida gaunant užklausas");
        return res.json();
      })
      .then((data) => {
        const initialized = data.map((item) => ({
          ...item,
          status: item.status || "Nevertinta",
          convertedToProject: item.convertedToProject || false,
          deliveryDate: item.deliveryDate || "",
          orderPrice: item.orderPrice || "",
          notes: item.notes || "",
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
    updateField(id, 'status', newStatus);
  };

  const toggleMessage = (id) => {
    setExpandedMessageIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const convertToProject = (id) => {
  const request = requests.find(req => req.id === id);
  if (!request) return;

  fetch(`http://localhost:8083/api/contact-requests/convert/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: id, // Ar tikrai tai yra teisingas userId?
      deliveryDate: request.deliveryDate,
      orderPrice: request.orderPrice,
      notes: request.notes
    }),
  })
  .then((res) => {
    if (!res.ok) throw new Error("Nepavyko konvertuoti į projektą");
    return res.json();
  })
  .then((project) => {
    alert(`Užklausa paversta projektu #${project.id}`);
    updateField(id, 'convertedToProject', true);
  })
  .catch((err) => alert(err.message));
};

  const startEditing = (id, field) => {
    setEditingField({ id, field });
  };

  const handleFieldChange = (id, field, value) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, [field]: value } : req
      )
    );
  };

  const saveField = (id, field) => {
    const request = requests.find(req => req.id === id);
    if (!request) return;

    updateField(id, field, request[field]);
    setEditingField({ id: null, field: null });
  };

  const updateField = (id, field, value) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, [field]: value } : req))
    );

    fetch(`http://localhost:8083/api/contact-requests/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ [field]: value }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Nepavyko išsaugoti ${field}`);
      })
      .catch((err) => {
        alert(`Klaida saugant ${field}: ` + err.message);
      });
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
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "40px" }}>
              Data
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "30px" }}>
              Vardas
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "55px" }}>
              Telefonas
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "60px" }}>
              El. paštas
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "220px" }}>
              Žinutė
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "30px" }}>
              Failas
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "55px" }}>
              Būsena
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "50px" }}>
              Veiksmai
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "50px" }}>
              Pristatymo data
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "50px" }}>
              Užsakymo kaina
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd", width: "70px" }}>
              Pastabos
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
                      ? "projektas"
                      : "sukurti projektą"}
                  </button>
                </td>
                <td style={{ padding: "10px" }}>
                  {editingField.id === request.id && editingField.field === 'deliveryDate' ? (
                    <>
                      <input
                        type="date"
                        value={request.deliveryDate || ''}
                        onChange={(e) => handleFieldChange(request.id, 'deliveryDate', e.target.value)}
                        style={{ width: '100%', padding: '4px' }}
                      />
                      <button 
                        onClick={() => saveField(request.id, 'deliveryDate')}
                        style={{ 
                          marginTop: '5px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '2px 5px',
                          cursor: 'pointer'
                        }}
                      >
                        ✓
                      </button>
                    </>
                  ) : (
                    <div 
                      onClick={() => startEditing(request.id, 'deliveryDate')}
                      style={{ cursor: 'pointer', minHeight: '20px' }}
                    >
                      {request.deliveryDate ? formatDate(request.deliveryDate) : "Nenustatyta"}
                    </div>
                  )}
                </td>
                <td style={{ padding: "10px" }}>
                  {editingField.id === request.id && editingField.field === 'orderPrice' ? (
                    <>
                      <input
                        type="text"
                        value={request.orderPrice || ''}
                        onChange={(e) => handleFieldChange(request.id, 'orderPrice', e.target.value)}
                        style={{ width: '100%', padding: '4px' }}
                        placeholder="Įveskite kainą"
                      />
                      <button 
                        onClick={() => saveField(request.id, 'orderPrice')}
                        style={{ 
                          marginTop: '5px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '2px 5px',
                          cursor: 'pointer'
                        }}
                      >
                        ✓
                      </button>
                    </>
                  ) : (
                    <div 
                      onClick={() => startEditing(request.id, 'orderPrice')}
                      style={{ cursor: 'pointer', minHeight: '20px' }}
                    >
                      {request.orderPrice || "Nenustatyta"}
                    </div>
                  )}
                </td>
                <td style={{ padding: "10px" }}>
                  {editingField.id === request.id && editingField.field === 'notes' ? (
                    <>
                      <textarea
                        value={request.notes || ''}
                        onChange={(e) => handleFieldChange(request.id, 'notes', e.target.value)}
                        style={{ width: '100%', padding: '4px', minHeight: '50px' }}
                        placeholder="Įveskite pastabas"
                      />
                      <button 
                        onClick={() => saveField(request.id, 'notes')}
                        style={{ 
                          marginTop: '5px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '2px 5px',
                          cursor: 'pointer'
                        }}
                      >
                        ✓
                      </button>
                    </>
                  ) : (
                    <div 
                      onClick={() => startEditing(request.id, 'notes')}
                      style={{ cursor: 'pointer', minHeight: '50px' }}
                    >
                      {request.notes || "Nėra pastabų"}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
          {requests.length === 0 && !loading && (
            <tr>
              <td colSpan="11" style={{ textAlign: "center", padding: "20px" }}>
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