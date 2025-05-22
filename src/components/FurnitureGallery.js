import { Link } from "react-router-dom";

import "./App.css";
import "./styles/Footer.css";
import "./styles/ContactPage.css";


const categories = [
  { id: "virtuvės", name: "Virtuvės baldai", image: "/images/virtuves.jpg" },
  { id: "spintos", name: "Spintos", image: "/images/spintos.jpg" },
  { id: "kiti", name: "Kiti baldai", image: "/images/kiti.jpg" }
];

const FurnitureGallery = () => {
  return (
    <div className="gallery-container">
      <h1 className="gallery-title">Baldų Kategorijos</h1>
      <div className="furniture-gallery">
        {categories.map((category) => (
          <Link to={`/category/${category.id}`} key={category.id} className="category-card-link">
            <div className="category-card">
              <img src={category.image} alt={category.name} />
              <h2>{category.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FurnitureGallery;
