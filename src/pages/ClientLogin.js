import React, { useState } from "react";

function ClientLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // Čia imituosime paprastą prisijungimą – pvz., fiksuotas vartotojas ir slaptažodis
  const validUsers = {
    client1: "password1",
    client2: "password2",
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validUsers[username] && validUsers[username] === password) {
      setError(null);
      onLogin(username); // perduoti username prisijungus
    } else {
      setError("Neteisingas vartotojo vardas arba slaptažodis");
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "auto", padding: "1rem" }}>
      <h2>Prisijungimas užsakovui</h2>
      <form onSubmit={handleSubmit}>
        <label>Vartotojo vardas:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Įveskite vartotojo vardą"
          required
        />
        <label>Slaptažodis:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Įveskite slaptažodį"
          required
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Prisijungti</button>
      </form>
    </div>
  );
}

export default ClientLogin;
