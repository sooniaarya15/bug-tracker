import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/projects")
      .then(setProjects)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function create(e) {
    e.preventDefault();
    setError("");
    try {
      const p = await api("/projects", { method: "POST", body: form });
      setProjects([p, ...projects]);
      setForm({ title: "", description: "" });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 text-2xl font-bold">Projects</h1>

      <form onSubmit={create} className="card mb-6 grid gap-2 md:grid-cols-[1fr_2fr_auto]">
        <input className="input" placeholder="Project title" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input className="input" placeholder="Description (optional)" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn-primary">+ Create</button>
      </form>

      {error && <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-500">Abhi koi project nahi hai. Upar se banao.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p._id} to={`/projects/${p._id}`} className="card block transition hover:shadow-md">
              <h2 className="font-semibold">{p.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">{p.description || "No description"}</p>
              <p className="mt-3 text-xs text-gray-400">👥 {p.members.length} member(s)</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}