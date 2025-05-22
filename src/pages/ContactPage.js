import React, { useState } from "react";
import ContactForm from "../components/ContactForm";
import '../styles/ContactPage.css';

const ContactPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="contact-page">
      {/* Kontaktų informacija */}
      <div className="contact-info">
        <h2>Susisiekite su mumis</h2>
        <p><strong>Įmonė:</strong> MB „ReBald“</p>
        <p><strong>Tel.:</strong> +370 600 00000</p>
        <p><strong>El. paštas:</strong> info@rebald.lt</p>
        <p><strong>Adresas:</strong> Kaunas, Lietuva</p>
      </div>

      {/* Pateikti užklausą mygtukas */}
      <div className="contact-box" onClick={openModal}>
        
        <span className="contact-text">Pateikti užklausą</span>
      </div>

      {/* Modalas */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ContactForm />
            <button className="close-button" onClick={closeModal}>Uždaryti</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactPage;
