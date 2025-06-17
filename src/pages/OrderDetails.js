import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrderProgressTracker from '../pages/OrderProgressTracker';
import '../styles/OrderDetails.css';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8083/api/contact-requests/${id}`);
        if (!response.ok) throw new Error('Užsakymas nerastas');
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`http://localhost:8083/api/contact-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) throw new Error('Nepavyko atnaujinti būsenos');
      setOrder(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Kraunama...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div className="not-found">Užsakymas nerastas</div>;

  return (
    <div className="order-details-container">
      <button onClick={() => navigate(-1)} className="back-button">
        &larr; Grįžti atgal
      </button>
      
      <h2>Užsakymo #{order.id} detalės</h2>
      
      <div className="order-info">
        <div className="info-section">
          <h3>Pagrindinė informacija</h3>
          <p><strong>Klientas:</strong> {order.name}</p>
          <p><strong>El. paštas:</strong> {order.email}</p>
          <p><strong>Telefonas:</strong> {order.phone}</p>
          <p><strong>Sukurta:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        
        <div className="info-section">
          <h3>Užklausa</h3>
          <p>{order.message}</p>
          {order.file && (
            <a href={order.file} target="_blank" rel="noopener noreferrer">
              Atsisiųsti failą
            </a>
          )}
        </div>
      </div>
      
      <div className="progress-section">
        <h3>Užsakymo progresas</h3>
        <OrderProgressTracker 
          currentStatus={order.status} 
          onStatusChange={handleStatusChange}
          editable={true}
        />
      </div>
      
      <div className="additional-info">
        <h3>Papildoma informacija</h3>
        <p><strong>Pristatymo data:</strong> {order.deliveryDate || 'Nenustatyta'}</p>
        <p><strong>Kaina:</strong> {order.orderPrice || 'Nenustatyta'}</p>
        <p><strong>Pastabos:</strong> {order.notes || 'Nėra'}</p>
      </div>
    </div>
  );
};

export default OrderDetails;