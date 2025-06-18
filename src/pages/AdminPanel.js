import React, { useState, useEffect, useMemo, useCallback } from "react";
import { format, parseISO } from 'date-fns';
import { lt } from 'date-fns/locale';
import PropTypes from 'prop-types';
import "../styles/AdminPanel.css";

// API servisas atskirai
const apiService = {
  fetchRequests: () => fetch("http://localhost:8083/api/contact-requests").then(handleResponse),
  deleteRequest: (id) => 
  fetch(`http://localhost:8083/api/contact-requests/${id}`, { 
    method: "DELETE" 
  })
  .then(res => {
    if (!res.ok) {
      return res.json().then(err => Promise.reject(err));
    }
    return res;
  })
  .catch(err => {
    throw new Error(err.message || 'Failed to delete request');
  }),
  convertToProject: (id, data) => fetch(`http://localhost:8083/api/contact-requests/convert/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateRequest: (id, data) => fetch(`http://localhost:8083/api/contact-requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(data)
  }).then(handleResponse)
};

const handleResponse = (res) => {
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

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

const Tooltip = ({ content, children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="tooltip-container">
      <div 
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>
      {visible && <div className="tooltip">{content}</div>}
    </div>
  );
};

Tooltip.propTypes = {
  content: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired
};

const AdminPanel = () => {
  const [requests, setRequests] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    fetch: false,
    delete: false,
    convert: false,
    update: false
  });
  const [notifications, setNotifications] = useState([]);
  const [expandedMessageIds, setExpandedMessageIds] = useState(new Set());
  const [editingField, setEditingField] = useState({ id: null, field: null });

  const formatDate = useCallback((isoString) => {
    return isoString ? format(parseISO(isoString), 'yyyy-MM-dd', { locale: lt }) : "";
  }, []);

  const addNotification = useCallback((message, type = 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingStates(prev => ({...prev, fetch: true}));
      try {
        const data = await apiService.fetchRequests();
        const initialized = data.map(item => ({
          ...item,
          status: item.status || "Nevertinta",
          convertedToProject: item.convertedToProject || false,
          deliveryDate: item.deliveryDate || "",
          orderPrice: item.orderPrice || "",
          notes: item.notes || "",
        }));
        setRequests(initialized);
      } catch (err) {
        addNotification(err.message);
      } finally {
        setLoadingStates(prev => ({...prev, fetch: false}));
      }
    };

    fetchData();
  }, [addNotification]);

  const handleDelete = async (id) => {
    if (!window.confirm("Ar tikrai norite ištrinti šią užklausą?")) return;
    
    setLoadingStates(prev => ({...prev, delete: true}));
    try {
      await apiService.deleteRequest(id);
      setRequests(prev => prev.filter(req => req.id !== id));
      addNotification("Užklausa sėkmingai ištrinta", "success");
    } catch (err) {
      addNotification(err.message);
    } finally {
      setLoadingStates(prev => ({...prev, delete: false}));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiService.updateRequest(id, { status: newStatus });
      setRequests(prev => 
        prev.map(req => req.id === id ? { ...req, status: newStatus } : req)
      );
    } catch (err) {
      addNotification(err.message);
    }
  };

  const toggleMessage = useCallback((id) => {
    setExpandedMessageIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const convertToProject = async (id) => {
    const request = requests.find(req => req.id === id);
    if (!request) return;

    setLoadingStates(prev => ({...prev, convert: true}));
    try {
      const project = await apiService.convertToProject(id, {
        deliveryDate: request.deliveryDate,
        orderPrice: request.orderPrice,
        notes: request.notes
      });
      
      setRequests(prev =>
        prev.map(req =>
          req.id === id ? { ...req, convertedToProject: true, project } : req
        )
      );
      addNotification(`Užklausa paversta projektu #${project.id}`, "success");
    } catch (err) {
      addNotification(err.message);
    } finally {
      setLoadingStates(prev => ({...prev, convert: false}));
    }
  };

  const startEditing = useCallback((id, field) => {
    setEditingField({ id, field });
  }, []);

  const handleFieldChange = useCallback((id, field, value) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === id ? { ...req, [field]: value } : req
      )
    );
  }, []);

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
          addNotification("Neteisingas datos formatas.");
          return;
        }

        // Formatuojam kaip yyyy-MM-dd
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        value = `${year}-${month}-${day}`;
      }
    }

    setLoadingStates(prev => ({...prev, update: true}));
    try {
      await apiService.updateRequest(id, { [field]: value });
      setEditingField({ id: null, field: null });
    } catch (err) {
      addNotification(`Klaida išsaugant lauką: ${err.message}`);
    } finally {
      setLoadingStates(prev => ({...prev, update: false}));
    }
  };

  const formattedRequests = useMemo(() => {
    return requests.map(request => ({
      ...request,
      formattedCreatedAt: formatDate(request.createdAt),
      formattedDeliveryDate: formatDate(request.deliveryDate)
    }));
  }, [requests, formatDate]);

  const truncateLength = 100;

  return (
    <div className="admin-panel-container">
      <div className="admin-header">
        <h2>Užklausų valdymas</h2>
        <div className="admin-controls">
          {loadingStates.fetch && <div className="loading-spinner"></div>}
          {notifications.map(notification => (
            <div key={notification.id} className={`notification ${notification.type}`}>
              {notification.message}
            </div>
          ))}
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
              <th>Užklausa</th>
              <th>Failas</th>
              <th>Būsena</th>
              <th>Veiksmai</th>
              <th>Pristatymo data</th>
              <th>Kaina</th>
              <th>Pastabos</th>
            </tr>
          </thead>
          <tbody>
            {formattedRequests.length > 0 ? (
              formattedRequests.map((request) => {
                const isExpanded = expandedMessageIds.has(request.id);
                const message = request.message || "";
                const shortMessage = message.length > truncateLength
                  ? message.slice(0, truncateLength) + "..."
                  : message;

                return (
                  <tr key={request.id} className={request.convertedToProject ? "converted-row" : ""}>
                    <td className="id-cell">{request.id}</td>
                    <td>{request.formattedCreatedAt}</td>
                    <td>{request.name}</td>
                    <td>{request.phone}</td>
                    <td>{request.email}</td>
                    <td className="message-cell icon-cell">{message ? (
                        <div className="tooltip-wrapper">
                        <span className="info-icon">📨</span>
                        <div className="tooltip-box">{message}</div>
                        </div>) : "-"}
                    </td>

                    <td>
                      {request.file ? (
                        <a 
                          href={request.file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="file-link"
                          aria-label="Atidaryti failą"
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
                        disabled={loadingStates.update}
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
                          disabled={loadingStates.delete}
                          aria-label="Ištrinti užklausą"
                        >
                          {loadingStates.delete ? "Trinama..." : "Ištrinti"}
                        </button>
                        <button
                          onClick={() => convertToProject(request.id)}
                          disabled={request.convertedToProject || loadingStates.convert}
                          className={`convert-btn ${request.convertedToProject ? "converted" : ""}`}
                          aria-label="Konvertuoti į projektą"
                        >
                          {loadingStates.convert ? "Vykdoma..." : 
                           request.convertedToProject ? "✓ Projektas" : "Sukurti projektą"}
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
                            aria-label="Pristatymo data"
                          />
                          <button 
                            onClick={() => saveField(request.id, 'deliveryDate')}
                            className="save-btn"
                            disabled={loadingStates.update}
                            aria-label="Išsaugoti pakeitimus"
                          >
                            {loadingStates.update ? "..." : "✓"}
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => startEditing(request.id, 'deliveryDate')}
                          className="editable-field"
                          role="button"
                          tabIndex="0"
                          aria-label="Redaguoti pristatymo datą"
                        >
                          {request.formattedDeliveryDate || "Nenustatyta"}
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
                            aria-label="Užsakymo kaina"
                          />
                          <button 
                            onClick={() => saveField(request.id, 'orderPrice')}
                            className="save-btn"
                            disabled={loadingStates.update}
                            aria-label="Išsaugoti pakeitimus"
                          >
                            {loadingStates.update ? "..." : "✓"}
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => startEditing(request.id, 'orderPrice')}
                          className="editable-field"
                          role="button"
                          tabIndex="0"
                          aria-label="Redaguoti užsakymo kainą"
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
      aria-label="Pastabos"
    />
    <button 
      onClick={() => saveField(request.id, 'notes')}
      className="save-btn"
      disabled={loadingStates.update}
      aria-label="Išsaugoti pakeitimus"
    >
      {loadingStates.update ? "..." : "✓"}
    </button>
  </div>
) : (
  <Tooltip content={request.notes}>
    <div 
      className="editable-field notes-field" 
      onClick={() => startEditing(request.id, 'notes')}
      role="button"
      tabIndex="0"
      aria-label="Redaguoti pastabas"
    >
      <span className="info-icon">📝</span>
    </div>
  </Tooltip>
)}

                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="12" className="no-requests">
                  {loadingStates.fetch ? "Kraunasi..." : "Užklausų nėra"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

AdminPanel.propTypes = {
  requests: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      phone: PropTypes.string,
      email: PropTypes.string,
      message: PropTypes.string,
      status: PropTypes.string,
      convertedToProject: PropTypes.bool,
      deliveryDate: PropTypes.string,
      orderPrice: PropTypes.string,
      notes: PropTypes.string,
      file: PropTypes.string,
      createdAt: PropTypes.string,
    })
  ),
};

export default AdminPanel;