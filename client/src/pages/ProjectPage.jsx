import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { STATUSES } from "../constants";
import Breadcrumbs from "../components/Breadcrumbs";
import TicketForm from "../components/TicketForm";
import TicketCard from "../components/TicketCard";
import MembersPanel from "../components/MembersPanel";
import Board from "../components/Board";
import Filters from "../components/Filters";
import TicketModal from "../components/TicketModal";

const EMPTY = { search: "", status: "", priority: "", assignee: "" };
const RANK = { critical: 0, high: 1, medium: 2, low: 3 };

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [view, setView] = useState("board");
  const [showForm, setShowForm] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(EMPTY);
  const [query, setQuery] = useState(EMPTY); // debounced filters
  const [sort, setSort] = useState("default");

  useEffect(() => {
    const t = setTimeout(() => setQuery(filters), 300);
    return () => clearTimeout(t);
  }, [filters]);

  const loadTickets = useCallback(async () => {
    const params = new URLSearchParams({ project: id });
    Object.entries(query).forEach(([k, v]) => v && params.set(k, v));
    setTickets(await api(`/tickets?${params}`));
  }, [id, query]);

  useEffect(() => {
    api(`/projects/${id}`).then(setProject).catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    loadTickets().catch((e) => setError(e.message));
  }, [loadTickets]);

  const visible = useMemo(() => {
    const a = [...tickets];
    if (sort === "newest") a.sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt));
    else if (sort === "oldest") a.sort((x, y) => new Date(x.createdAt) - new Date(y.createdAt));
    else if (sort === "priority") a.sort((x, y) => RANK[x.priority] - RANK[y.priority]);
    return a;
  }, [tickets, sort]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!project) return <p>Loading…</p>;

  const myRole = project.members.find((m) => m.user._id === user._id)?.role;
  const isAdmin = myRole === "admin";
  const canEdit = myRole && myRole !== "viewer";

  async function createTicket(form) {
    await api("/tickets", { method: "POST", body: { ...form, project: id } });
    await loadTickets();
    setShowForm(false);
  }

  async function handleMove(next, affected) {
    const prev = tickets;
    const items = affected.flatMap((k) => next[k].map((t, i) => ({ _id: t._id, status: k, order: i })));
    setTickets(STATUSES.flatMap((s) => next[s.key].map((t, i) => ({ ...t, order: i }))));
    try {
      await api("/tickets/reorder", { method: "PATCH", body: { projectId: id, items } });
    } catch (e) {
      setTickets(prev);
      alert(e.message); 
    }
  }

  async function deleteProject() {
    if (!window.confirm("Delete this project and all its tickets?")) return;
    await api(`/projects/${id}`, { method: "DELETE" });
    navigate("/");
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Breadcrumbs items={[{ label: "Projects", to: "/" }, { label: project.title }]} />

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          {project.description && <p className="text-sm text-gray-500">{project.description}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex overflow-hidden rounded-md border border-gray-300 text-sm">
            {["board", "list"].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-2 capitalize ${view === v ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}>
                {v}
              </button>
            ))}
          </div>
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

      <Filters
        filters={filters}
        setFilters={setFilters}
        members={project.members}
        sort={sort}
        setSort={setSort}
        showSort={view === "list"}
      />

      {view === "board" ? (
        <Board tickets={tickets} onMove={handleMove} onSelect={setSelected} canEdit={canEdit} />
      ) : visible.length === 0 ? (
        <p className="text-gray-500">No tickets match your filters.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((t) => <TicketCard key={t._id} ticket={t} showStatus onClick={setSelected} />)}
        </div>
      )}

      {selected && (
        <TicketModal
          ticket={selected}
          project={project}
          me={user}
          canEdit={canEdit}
          isAdmin={isAdmin}
          onClose={() => setSelected(null)}
          onChanged={loadTickets}
        />
      )}
    </div>
  );
}