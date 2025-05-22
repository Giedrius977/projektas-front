import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./App.css";

const API_URL = "http://localhost:3000/furniture";

const FurnitureDetail = () => {
  const { id } = useParams();
  const [furniture, setFurniture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(API_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Serverio klaida: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Gauti baldai:", data);

        if (!Array.isArray(data)) {
          throw new Error("Gauti netinkami duomenys – laukiama masyvo.");
        }

        const selectedFurniture = data.find(f => f.id === id);
        setFurniture(selectedFurniture || null);
      })
      .catch(error => {
        console.error("Klaida gaunant duomenis:", error);
        setError(error.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <h1>Įkeliama...</h1>;
  }

  if (error) {
    return <h1>Klaida: {error}</h1>;
  }

  if (!furniture) {
    return <h1>Baldas nerastas!</h1>;
  }

  return (
    <div className="furniture-detail-container">
      <img src={furniture.image} alt={furniture.name} />
      <h1>{furniture.name}</h1>
      <p className="furniture-description">{furniture.description}</p>
    </div>
  );
};

export default FurnitureDetail;
