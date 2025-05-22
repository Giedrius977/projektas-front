import AutoChangingGallery from "./components/AutoChangingGallery";
import CategoryGallery from "./components/CategoryGallery";

import AdminPanel from "./pages/AdminPanel";
import Footer from "./components/Footer";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import ContactPage from "./pages/ContactPage";
import About from "./pages/About";

import "./App.css";
import "./styles/Footer.css";
import "./styles/ContactPage.css";


const Header = () => (
  <header className="header">
    <img src="/images/logo.jpg" alt="Logotipas" className="logo" />
    <nav className="nav-links">
      <Link to="/about">Apie mus</Link>
      <Link to="/contact">Kontaktai</Link>
    </nav>
  </header>
);

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<AutoChangingGallery />} />
        <Route path="/category/:id" element={<CategoryGallery />} />

        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactPage />} /> {/* NAUJAS komponentas */}
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
