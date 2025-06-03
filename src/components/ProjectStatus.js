import React, { useEffect, useState } from "react";

const statusOptions = [
  "Vertinamas",
  "Patvirtintas",
  "Gaminamas",
  "Paruoštas",
  "Pristatytas",
  "Užbaigtas"
];

function ProjectStatus({ projectId }) {
  const [project, setProject] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8083/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => {
        setProject(data);
        setNewStatus(data.status);
      });
  }, [projectId]);

  const handleStatusChange = () => {
    if (!newStatus || newStatus === project.status) return;

    const updatedHistory = [...(project.statusHistory || []), {
      status: newStatus,
      date: new Date().toISOString(),
      comment: `Statusas pakeistas į "${newStatus}"`
    }];

    fetch(`http://localhost:8083/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        statusHistory: updatedHistory
      })
    })
      .then(res => res.json())
      .then(updatedProject => {
        setProject(updatedProject);
        alert("Statusas atnaujintas");
      });
  };

  if (!project) return <div>Įkeliama...</div>;

  return (
    <div>
      <h3>Projekto statusas: {project.status}</h3>
      <select
        value={newStatus}
        onChange={e => setNewStatus(e.target.value)}
      >
        {statusOptions.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button onClick={handleStatusChange}>Pakeisti statusą</button>

      <h4>Statuso istorija:</h4>
      <ul>
        {project.statusHistory && project.statusHistory.map((item, i) => (
          <li key={i}>
            <strong>{item.status}</strong> – {new Date(item.date).toLocaleString()} <br />
            {item.comment}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProjectStatus;
