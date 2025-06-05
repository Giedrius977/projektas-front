import React, { useState } from "react";
import { Routes, Route, Link} from "react-router-dom";

import AutoChangingGallery from "./components/AutoChangingGallery";
import CategoryGallery from "./components/CategoryGallery";
import AdminPanel from "./pages/AdminPanel";
import Footer from "./components/Footer";
import ContactPage from "./pages/ContactPage";
import About from "./pages/About";
import LoginModal from "./components/LoginModal";
import ClientDashboard from "./pages/ClientDashboard";

import "./App.css";
import "./styles/Footer.css";
import "./styles/ContactPage.css";

// Header komponentas
const Header = ({ onLoginClick, userRole, isAuthenticated, onLogout }) => (
  <header className="header">
    <div className="left-group">
      <img src="/images/logo.jpg" alt="Logotipas" className="logo" />
      <span className="slogan">Viskas apie patogumą!</span>
    </div>
    <nav className="nav-links">
      {isAuthenticated ? (
        <>
          {userRole === "admin" && <Link to="/admin" className="nav-link">Admin</Link>}
          {userRole === "client" && <Link to="/client" className="nav-link">Užsakymai</Link>}
          <span onClick={onLogout} className="nav-link">Atsijungti</span>
        </>
      ) : (
        <span onClick={onLoginClick} className="nav-link">prisijungti</span>
      )}
      <Link to="/" className="nav-link">pradinis</Link>
      <Link to="/about" className="nav-link">apie mus</Link>
      <Link to="/contact" className="nav-link">kontaktai</Link>
    </nav>
  </header>
);

// Apsaugotas maršrutas
const ProtectedRoute = ({ children, isAuthenticated, userRole, requiredRole }) => {
  if (!isAuthenticated || userRole !== requiredRole) {
    return <h3 style={{ padding: "2rem", textAlign: "center" }}>⛔ Prieiga draudžiama. Prisijunkite kaip {requiredRole}.</h3>;
  }
  return children;
};

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null); // Reikalinga ClientDashboard

  const handleLogin = (username, password) => {
  if (username === "admin" && password === "admin123") {
    setIsAuthenticated(true);
    setUserRole("admin");
    setIsLoginOpen(false);
    setUsername(username);
  } else if (password === username + "123") {
    // Bet koks klientas, jei slaptažodis yra username + '123'
    setIsAuthenticated(true);
    setUserRole("client");
    setIsLoginOpen(false);
    setUsername(username);
  } else {
    alert("Neteisingi prisijungimo duomenys");
  }
};

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUsername(null);
  };

  return (
    <>
      <Header
        onLoginClick={() => setIsLoginOpen(true)}
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />

      <Routes>
        <Route path="/" element={<AutoChangingGallery />} />
        <Route path="/category/:id" element={<CategoryGallery />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              requiredRole="admin"
            >
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              requiredRole="client"
            >
              <ClientDashboard username={username} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
