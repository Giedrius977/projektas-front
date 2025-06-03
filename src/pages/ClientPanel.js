import React, { useState } from "react";
import ClientLogin from "./ClientLogin";
import ClientDashboard from "./ClientDashboard";

function ClientPanel() {
  const [username, setUsername] = useState(null);

  return (
    <div>
      {!username ? (
        <ClientLogin onLogin={setUsername} />
      ) : (
        <ClientDashboard username={username} onLogout={() => setUsername(null)} />
      )}
    </div>
  );
}

export default ClientPanel;
