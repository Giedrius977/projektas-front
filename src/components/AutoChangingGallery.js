import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/AutoChangingGallery.css';

const categories = [
  { id: "virtuves", name: "Virtuvės", images: ["/images/virt_1.jpg", "/images/virt_2.jpg", "/images/virt_3.jpg","/images/virt_4.jpg", "/images/virt_5.jpg", "/images/virt_6.jpg","/images/virt_7.jpg", "/images/virt_8.jpg", "/images/virt_9.jpg"] },
  { id: "spintos", name: "Spintos", images: ["/images/spint_1.jpg", "/images/spint_2.jpg", "/images/spint_3.jpg",
      "/images/spint_4.jpg", "/images/spint_5.jpg", "/images/spint_6.jpg",
      "/images/spint_7.jpg", "/images/spint_8.jpg", "/images/spint_9.jpg"] },
  { id: "kiti", name: "Kiti baldai", images: ["/images/kiti_1.jpg", "/images/kiti_2.jpg", "/images/kiti_3.jpg",
      "/images/kiti_4.jpg", "/images/kiti_5.jpg", "/images/kiti_6.jpg",
      "/images/kiti_7.jpg", "/images/kiti_8.jpg", "/images/kiti_9.jpg"] }
];

const AutoChangingGallery = () => {
  const [imageIndexes, setImageIndexes] = useState([0, 0, 0]);
  const navigate = useNavigate();

  useEffect(() => {
    const intervals = categories.map((_, idx) => 
      setTimeout(() => {
        setInterval(() => {
          setImageIndexes(prevIndexes =>
            prevIndexes.map((index, i) => (i === idx ? (index + 1) % categories[i].images.length : index))
          );
        }, 4000);
      }, idx * 3000) // Laiko poslinkis tarp kiekvienos kategorijos
    );

    return () => intervals.forEach(clearTimeout);
  }, []);

  return (
    <div className="gallery-container">
      
      <div className="furniture-gallery">
        {categories.map((category, idx) => (
          <div key={category.id} className="category-card" onClick={() => navigate(`/category/${category.id}`)}>
            <div className="image-box">
              <img src={category.images[imageIndexes[idx]]} alt={category.name} />
            </div>
            <h2 className="image-caption">{category.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutoChangingGallery;
