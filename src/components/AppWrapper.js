// src/components/AppWrapper.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import LoginModal from "./LoginModal";
import App from "../App";

const AppWrapper = () => {
  const navigate = useNavigate();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (username, password) => {
  // Čia vietoje fiksuotų duomenų galėsi vėliau daryti fetch į backend
  if (username === "admin" && password === "admin123") {
    setIsAuthenticated(true);
    setUserRole("admin");
    setIsLoginOpen(false);
    navigate("/admin");
  } else if (username === "client" && password === "client1") {
    setIsAuthenticated(true);
    setUserRole("client");
    setIsLoginOpen(false);
    navigate("/client");  // atskiras užsakovo kelias
  } else {
    alert("Neteisingi prisijungimo duomenys");
  }
};


  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    navigate("/");
  };

  return (
    <>
      
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />
      <App
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        openLogin={() => setIsLoginOpen(true)}  // jei reikės atidaryti login iš App
        onLogout={handleLogout}                 // jei reikės atsijungimo mygtuko App
      />
    </>
  );
};

export default AppWrapper;
