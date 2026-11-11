import { useState } from "react";
import { api } from "../api";

export default function MembersPanel({ project, isAdmin, onChange }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("developer");
  const [error, setError] = useState("");

  async function add(e) {
    e.preventDefault();
    setError("");
    try {
      onChange(await api(`/projects/${project._id}/members`, { method: "POST", body: { email, role } }));
      setEmail("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(userId) {
    if (!window.confirm("Remove this member?")) return;
    try {
      onChange(await api(`/projects/${project._id}/members/${userId}`, { method: "DELETE" }));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h3 className="mb-2 font-semibold">Team members</h3>
      {error && <p className="mb-2 rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      <ul className="mb-3 divide-y text-sm">
        {project.members.map((m) => (
          <li key={m.user._id} className="flex items-center justify-between py-2">
            <span>
              {m.user.name} <span className="text-gray-400">({m.user.email})</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{m.role}</span>
              {isAdmin && m.user._id !== project.owner && (
                <button onClick={() => remove(m.user._id)} className="text-xs text-red-600 hover:underline">Remove</button>
              )}
            </span>
          </li>
        ))}
      </ul>
      {isAdmin && (
        <form onSubmit={add} className="grid gap-2 sm:grid-cols-[2fr_1fr_auto]">
          <input className="input" type="email" placeholder="Member's email (registered hona chahiye)" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="admin">admin</option>
            <option value="manager">manager</option>
            <option value="developer">developer</option>
            <option value="viewer">viewer</option>
          </select>
          <button className="btn-primary">Add</button>
        </form>
      )}
    </div>
  );
}