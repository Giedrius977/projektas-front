import React, { useState } from "react";
import ContactForm from '../components/ContactForm';
import '../styles/Footer.css';

const Footer = ({ userRole }) => {
  const [showForm, setShowForm] = useState(false);

  // Jei vartotojas yra admin, nerodyti mygtuko ir formos
  if (userRole === "admin") return null;

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="contact-box">
          <button onClick={() => setShowForm(true)} className="contact-link">
            <img src="/images/email_icon.jpg" alt="Susisiekime" className="email-icon" />
          </button>
          <p className="contact-text">Pateikti užklausą</p>
        </div>
      </div>

      {showForm && <ContactForm onClose={() => setShowForm(false)} />}
    </footer>
  );
};

export default Footer;
