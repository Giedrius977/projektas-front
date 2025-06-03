// components/LoginModal.js
import React, { useState } from "react";
import '../styles/LoginModal.css'; // Susikurk šį CSS

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Prisijungimas</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Vartotojo vardas"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Slaptažodis"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Prisijungti</button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
