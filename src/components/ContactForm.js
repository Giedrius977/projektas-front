import React, { useState } from "react";

const ContactForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    file: null,
    fileName: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          file: reader.result,
          fileName: file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileRemove = () => {
    setFormData((prev) => ({
      ...prev,
      file: null,
      fileName: "",
    }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedDate = new Date().toISOString().slice(0, 19).replace("T", " "); // Teisingas formatas MySQL

    try {
        const response = await fetch("http://localhost:8083/api/contact-requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                message: formData.message,
                file: formData.file,
                createdAt: formattedDate, // 🟢 Pridėtas `formattedDate`
            }),
        });

        if (!response.ok) {
            throw new Error(`Klaida siunčiant formą: ${response.statusText}`);
        }

        alert("✅ Jūsų užklausa sėkmingai išsiųsta!");
        onClose();
    } catch (error) {
        alert("❌ Klaida siunčiant formą: " + error.message);
        console.error(error);
    }
};


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Susisiekite dėl baldų</h2>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>Vardas:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Telefonas:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <label>El. paštas:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Jūsų užklausa:</label>
          <textarea
            name="message"
            rows="6"
            value={formData.message}
            onChange={handleChange}
            required
          />

          <label>Pridėti failą:</label>
          <input type="file" name="file" onChange={handleFileChange} />

          {formData.file && (
            <div className="file-preview">
              <p>Įkeltas failas: {formData.fileName}</p>
              <button type="button" onClick={handleFileRemove}>
                Pašalinti failą
              </button>
            </div>
          )}

          <div className="button-group">
            <button type="submit">Siųsti</button>
            <button type="button" onClick={onClose} className="close-button">
              Uždaryti
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
