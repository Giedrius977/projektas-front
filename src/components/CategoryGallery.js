import React, { useEffect, useState } from "react"; 
import { useParams } from "react-router-dom";
import '../styles/CategoryGallery.css';

const API_URL = "http://localhost:3000/furniture"; // 🔹 API adresas

const CategoryGallery = () => { 
const { id } = useParams(); 
const [items, setItems] = useState([]); 
const [loading, setLoading] = useState(true); 
const [error, setError] = useState(null); 
const removeDiacritics = (str) =>str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
useEffect(() => { fetch(API_URL)
  .then(response => response.json())
  .then(data => { console.log("🔍 API atsakymas:", data);

const furnitureArray = Array.isArray(data) ? data : data.furniture || [];
  console.log("🔍 Baldų masyvas:", furnitureArray);
if (!furnitureArray.length) { throw new Error("⚠️ JSON struktūra neteisinga – baldų masyvas tuščias.");}
const filteredItems = furnitureArray.filter(item => removeDiacritics(item.category.trim().toLowerCase()) === removeDiacritics(id.trim().toLowerCase()) );
  console.log("🔍 Filtruoti baldai:", filteredItems);
  setItems(filteredItems);
  setLoading(false); })
.catch(err => { 
  console.error("🚨 Klaida gaunant duomenis:", err);
  setError(err.message); 
  setLoading(false); }); }, [id]);

  if (loading) return <h1>🔄 Įkeliama...</h1>; if (error) return <h1>❌ Klaida: {error}</h1>; 
  if (items.length === 0) return <h1>⚠️ Šioje kategorijoje nėra 
    baldų.</h1>;
return ( <div className="category-gallery-container"> 
<h2>{id}</h2> {/* Rodomas pasirinktos kategorijos pavadinimas */}
{items.map((item, idx) => (
  <div key={idx} className="gallery-item-split">
    <div className="left-info">
      <h3>{item.name}</h3>
      <p className="gallery-description">{item.description}</p>
    </div>
    <div className="right-gallery">
      <div className="scrollable-images">
        {item.images.map((imgSrc, imgIdx) => (
          <img
            key={imgIdx}
            src={imgSrc}
            alt={`${item.name} - ${imgIdx + 1}`}
            className="gallery-image"
          />
        ))}
      </div>
    </div>
  </div>
))}
 </div>
); 
};
export default CategoryGallery; 