import React, { useState, useEffect } from "react";
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: "",
    client: "",
    description: "",
  });

  // Gauti projektus iš JSON serverio
  useEffect(() => {
    fetch("http://localhost:3000/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  // Naujo projekto pateikimas
  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:3000/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProject),
    })
      .then((res) => res.json())
      .then((data) => {
        setProjects([...projects, data]);
        setNewProject({ name: "", client: "", description: "" });
      });
  };

  return (
    <div className="admin-panel">
      <h2>Projektų valdymas</h2>

      <form className="admin-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Projekto pavadinimas"
          value={newProject.name}
          onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Klientas"
          value={newProject.client}
          onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
          required
        />
        <textarea
          placeholder="Aprašymas"
          value={newProject.description}
          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
          required
        />
        <button type="submit">Pridėti projektą</button>
      </form>

      <ul className="project-list">
        {projects.map((project) => (
          <li key={project.id}>
            <h4>{project.name}</h4>
            <p><strong>Klientas:</strong> {project.client}</p>
            <p>{project.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
