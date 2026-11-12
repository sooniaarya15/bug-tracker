import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import TicketForm from "../components/TicketForm";
import TicketCard from "../components/TicketCard";
import MembersPanel from "../components/MembersPanel";

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/projects/${id}`).then(setProject).catch((e) => setError(e.message));
    api(`/tickets?project=${id}`).then(setTickets).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!project) return <p className="p-6">Loading…</p>;

  const myRole = project.members.find((m) => m.user._id === user._id)?.role;
  const isAdmin = myRole === "admin";
  const canEdit = myRole && myRole !== "viewer";

  async function createTicket(form) {
    const t = await api("/tickets", { method: "POST", body: { ...form, project: id } });
    setTickets([...tickets, t]);
    setShowForm(false);
  }

  async function deleteProject() {
    if (!window.confirm("Delete this project and all its tickets?")) return;
    await api(`/projects/${id}`, { method: "DELETE" });
    navigate("/");
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          {project.description && <p className="text-sm text-gray-500">{project.description}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => setShowMembers(!showMembers)}>
            👥 Members ({project.members.length})
          </button>
          {canEdit && <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ New Ticket</button>}
          {isAdmin && <button className="btn-danger" onClick={deleteProject}>Delete</button>}
        </div>
      </div>

      {showMembers && (
        <div className="card mb-4">
          <MembersPanel project={project} isAdmin={isAdmin} onChange={setProject} />
        </div>
      )}

      {showForm && (
        <div className="card mb-4">
          <TicketForm members={project.members} onSubmit={createTicket} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {tickets.length === 0 ? (
        <p className="text-gray-500">Abhi koi ticket nahi hai.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((t) => <TicketCard key={t._id} ticket={t} showStatus />)}
        </div>
      )}
    </div>
  );
}