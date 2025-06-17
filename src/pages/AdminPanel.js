import React, { useState, useEffect, useMemo, useCallback } from "react";
import { format, parseISO } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import { lt } from 'date-fns/locale';
import PropTypes from 'prop-types';
import "../styles/AdminPanel.css";
import OrderProgressTracker from '../pages/OrderProgressTracker';

// API servisas atskirai

const apiService = {
  /**
   * Gauna visus kontaktinius prašymus
   */
  fetchRequests: async () => {
    try {
      const response = await fetch("http://localhost:8083/api/contact-requests", {
        headers: {
          "Accept": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || response.statusText || 'Failed to fetch requests');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      throw new Error(error.message || 'Failed to fetch requests');
    }
  },

  /**
   * Ištrina kontaktinį prašymą
   */
  deleteRequest: async (id) => {
    try {
      const response = await fetch(`http://localhost:8083/api/contact-requests/${id}?forceDelete=true`, {
  method: "DELETE",
  headers: {
    "Accept": "application/json"
  }
});

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to delete request');
      }

      return true; // Grąžiname true sėkmės atveju
    } catch (error) {
      console.error(`Failed to delete request ${id}:`, error);
      throw new Error(error.message || 'Failed to delete request');
    }
  },

  /**
   * Konvertuoja užklausą į projektą
   */
  convertToProject: async (id) => {
    try {
      const response = await fetch(`http://localhost:8083/api/contact-requests/${id}/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({}) // Galite pridėti papildomų duomenų jei reikia
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to convert request');
      }

      const result = await response.json();
      
      // Grąžiname ir projektą ir atnaujintą užklausą (priklausomai nuo API atsakymo struktūros)
      return {
        project: result.project,
        updatedRequest: result.updatedRequest || { id, convertedToProject: true }
      };
      
    } catch (error) {
      console.error(`Failed to convert request ${id}:`, error);
      throw new Error(error.message || 'Failed to convert request');
    }
  },

  /**
   * Atnaujina kontaktinį prašymą
   */
  updateRequest: async (id, data) => {
    try {
      const response = await fetch(`http://localhost:8083/api/contact-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update request');
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to update request ${id}:`, error);
      throw new Error(error.message || 'Failed to update request');
    }
  }
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
  const navigate = useNavigate();
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

  const handleRowClick = (id) => {
    navigate(`/order-details/${id}`);
  };

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
            {formattedRequests.map((request) => {
              const isExpanded = expandedMessageIds.has(request.id);
              const message = request.message || "";
              const shortMessage = message.length > truncateLength
                ? message.slice(0, truncateLength) + "..."
                : message;

              return (
                <tr 
                  key={request.id} 
                  className={request.convertedToProject ? "converted-row" : ""}
                  onClick={() => handleRowClick(request.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="id-cell" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/order-details/${request.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {request.id}
                    </Link>
                  </td>
                  <td>{request.formattedCreatedAt}</td>
                  <td>{request.name}</td>
                  <td>{request.phone}</td>
                  <td>{request.email}</td>
                  <td className="message-cell">
                    <Tooltip content={message}>
                      <span className="message-content">
                        {shortMessage}
                        {message.length > truncateLength && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMessage(request.id);
                            }}
                            className="toggle-message-btn"
                            aria-label={isExpanded ? "Sutraukti pranešimą" : "Išskleisti pranešimą"}
                          >
                            {isExpanded ? "▲" : "▼"}
                          </button>
                        )}
                      </span>
                    </Tooltip>
                  </td>
                  <td>
                    {request.file ? (
                      <a 
                        href={request.file} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="file-link"
                        aria-label="Atidaryti failą"
                        onClick={(e) => e.stopPropagation()}
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
                      onClick={(e) => e.stopPropagation()}
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(request.id);
                        }}
                        className="delete-btn"
                        disabled={loadingStates.delete}
                        aria-label="Ištrinti užklausą"
                      >
                        {loadingStates.delete ? "Trinama..." : "Ištrinti"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          convertToProject(request.id);
                        }}
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
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            saveField(request.id, 'deliveryDate');
                          }}
                          className="save-btn"
                          disabled={loadingStates.update}
                          aria-label="Išsaugoti pakeitimus"
                        >
                          {loadingStates.update ? "..." : "✓"}
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(request.id, 'deliveryDate');
                        }}
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
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            saveField(request.id, 'orderPrice');
                          }}
                          className="save-btn"
                          disabled={loadingStates.update}
                          aria-label="Išsaugoti pakeitimus"
                        >
                          {loadingStates.update ? "..." : "✓"}
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(request.id, 'orderPrice');
                        }}
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
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            saveField(request.id, 'notes');
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(request.id, 'notes');
                          }}
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
            })}
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