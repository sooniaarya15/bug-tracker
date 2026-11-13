import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useMatch, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const match = useMatch("/projects/:id");
  const currentId = match?.params.id || "";
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api("/projects").then(setProjects).catch(() => {});
    setOpen(false);
  }, [pathname]);

  const linkClass = ({ isActive }) =>
    `block rounded px-3 py-2 text-sm ${isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800"}`;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {open && <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 shrink-0 transform bg-slate-900 p-4 text-slate-100 transition md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link to="/" className="mb-6 block text-xl font-bold">🐛 BugTracker</Link>
        <NavLink to="/" end className={linkClass}>📁 All Projects</NavLink>

        <label className="mt-6 block text-xs uppercase tracking-wide text-slate-400">Switch project</label>
        <select
          className="mt-1 w-full rounded bg-slate-800 p-2 text-sm"
          value={currentId}
          onChange={(e) => e.target.value && navigate(`/projects/${e.target.value}`)}
        >
          <option value="">Select…</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>

        <div className="mt-6 space-y-1">
          {projects.map((p) => (
            <NavLink key={p._id} to={`/projects/${p._id}`} className={linkClass}>• {p.title}</NavLink>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-white px-4 py-3">
          <button className="text-xl md:hidden" onClick={() => setOpen(true)}>☰</button>
          <span className="hidden md:block" />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">👤 {user.name}</span>
            <button className="btn-secondary" onClick={logout}>Logout</button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}