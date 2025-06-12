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
    return new Date(isoString).toLocaleDateString('lt-LT');
  };

  const handleDelete = (id) => {
    if (!window.confirm("Ar tikrai norite ištrinti šią užklausą?")) return;
    
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
        setRequests(prev =>
          prev.map(req =>
            req.id === id ? { ...req, project } : req
          )
        );
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
const saveField = async (id, field) => {
  const request = requests.find((req) => req.id === id);
  if (!request) return;

  let value = request[field];

  if (field === "deliveryDate") {
    if (!value) {
      value = null;
    } else {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        alert("Neteisingas datos formatas.");
        return;
      }

      // Formatuojam kaip yyyy-MM-dd
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      value = `${year}-${month}-${day}`;
    }
  }

  try {
    await updateField(id, field, value);
    setEditingField({ id: null, field: null });
  } catch (err) {
    alert(`Klaida išsaugant lauką: ${err.message}`);
  }
};



  const updateField = async (id, field, value) => {
    try {
      const payload = { [field]: value };

      const response = await fetch(`http://localhost:8083/api/contact-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Update failed');
      }

      return await response.json();
    } catch (err) {
      console.error(`Klaida atnaujinant ${field}:`, err);
      throw err;
    }
  };

  const truncateLength = 100;

  return (
    <div className="admin-panel-container">
      <div className="admin-header">
        <h2>Užklausų valdymas</h2>
        <div className="admin-controls">
          {loading && <div className="loading-spinner"></div>}
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>

      <div className="table-responsive">
        <table className="admin-requests-table">
          <thead>
            <tr>
              <th>Užsakymo nr.</th>
              <th>Data</th>
              <th>Vardas</th>
              <th>Telefonas</th>
              <th>El. paštas</th>
              <th>Žinutė</th>
              <th>Failas</th>
              <th>Būsena</th>
              <th>Veiksmai</th>
              <th>Pristatymo data</th>
              <th>Kaina</th>
              <th>Pastabos</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((request) => {
                const isExpanded = expandedMessageIds.has(request.id);
                const message = request.message || "";
                const shortMessage = message.length > truncateLength
                  ? message.slice(0, truncateLength) + "..."
                  : message;

                return (
                  <tr key={request.id} className={request.convertedToProject ? "converted-row" : ""}>
                    <td className="id-cell">{request.id}</td>
                    <td>{formatDate(request.createdAt)}</td>
                    <td>{request.name}</td>
                    <td>{request.phone}</td>
                    <td>{request.email}</td>
                    <td className="message-cell">
                      <div className={`message-content ${isExpanded ? "expanded" : ""}`}>
                        {isExpanded ? message : shortMessage}
                        {message.length > truncateLength && (
                          <button 
                            onClick={() => toggleMessage(request.id)}
                            className="toggle-message-btn"
                          >
                            {isExpanded ? "↑" : "↓"}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      {request.file ? (
                        <a 
                          href={request.file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="file-link"
                        >
                          <span className="file-icon">📄</span>
                        </a>
                      ) : "-"}
                    </td>
                    <td>
                      <select
                        value={request.status}
                        onChange={(e) => handleStatusChange(request.id, e.target.value)}
                        className="status-select"
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleDelete(request.id)}
                          className="delete-btn"
                        >
                          Ištrinti
                        </button>
                        <button
                          onClick={() => convertToProject(request.id)}
                          disabled={request.convertedToProject}
                          className={`convert-btn ${request.convertedToProject ? "converted" : ""}`}
                        >
                          {request.convertedToProject ? "✓ Projektas" : "Sukurti projektą"}
                        </button>
                      </div>
                    </td>
                    <td>
                      {editingField.id === request.id && editingField.field === 'deliveryDate' ? (
                        <div className="edit-container">
                          <input
                            type="date"
                            value={request.deliveryDate || ''}
                            onChange={(e) => handleFieldChange(request.id, 'deliveryDate', e.target.value)}
                            className="edit-input"
                          />
                          <button 
                            onClick={() => saveField(request.id, 'deliveryDate')}
                            className="save-btn"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => startEditing(request.id, 'deliveryDate')}
                          className="editable-field"
                        >
                          {request.deliveryDate ? formatDate(request.deliveryDate) : "Nenustatyta"}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingField.id === request.id && editingField.field === 'orderPrice' ? (
                        <div className="edit-container">
                          <input
                            type="text"
                            value={request.orderPrice || ''}
                            onChange={(e) => handleFieldChange(request.id, 'orderPrice', e.target.value)}
                            className="edit-input"
                          />
                          <button 
                            onClick={() => saveField(request.id, 'orderPrice')}
                            className="save-btn"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => startEditing(request.id, 'orderPrice')}
                          className="editable-field"
                        >
                          {request.orderPrice || "Nenustatyta"}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingField.id === request.id && editingField.field === 'notes' ? (
                        <div className="edit-container">
                          <textarea
                            value={request.notes || ''}
                            onChange={(e) => handleFieldChange(request.id, 'notes', e.target.value)}
                            className="edit-textarea"
                          />
                          <button 
                            onClick={() => saveField(request.id, 'notes')}
                            className="save-btn"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => startEditing(request.id, 'notes')}
                          className="editable-field notes-field"
                        >
                          {request.notes || "Nėra pastabų"}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="12" className="no-requests">
                  {loading ? "Kraunasi..." : "Užklausų nėra"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;